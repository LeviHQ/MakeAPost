import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { decryptToken, encryptToken } from '@/lib/crypto';

// Helper: Refresh X OAuth 2.0 token if expired
async function getValidXToken(connection, admin) {
  let accessToken = decryptToken(connection.access_token_enc);
  const isExpired = connection.expires_at
    ? new Date(connection.expires_at).getTime() < Date.now() + 60000 // 60s buffer
    : false;

  if (isExpired && connection.refresh_token_enc) {
    try {
      const refreshToken = decryptToken(connection.refresh_token_enc);
      const basicAuth = Buffer.from(
        `${process.env.X_CLIENT_ID || ''}:${process.env.X_CLIENT_SECRET || ''}`
      ).toString('base64');

      const refreshRes = await fetch('https://api.x.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.X_CLIENT_ID || '',
        }),
      });

      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData.access_token) {
        accessToken = refreshData.access_token;
        const newExpiresAt = new Date(
          Date.now() + (refreshData.expires_in || 7200) * 1000
        ).toISOString();

        await admin
          .from('social_connections')
          .update({
            access_token_enc: encryptToken(refreshData.access_token),
            refresh_token_enc: refreshData.refresh_token
              ? encryptToken(refreshData.refresh_token)
              : connection.refresh_token_enc,
            expires_at: newExpiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', connection.id);
      }
    } catch (refreshErr) {
      console.error('Failed to auto-refresh X token:', refreshErr);
    }
  }

  return accessToken;
}

// Helper: Publish to LinkedIn
async function publishToLinkedIn(connection, text, imageBuffer) {
  const accessToken = decryptToken(connection.access_token_enc);
  const personUrn = `urn:li:person:${connection.platform_user_id}`;

  let imageUrn = null;

  // 1. Upload Image via LinkedIn REST Images API
  if (imageBuffer) {
    try {
      const initRes = await fetch(
        'https://api.linkedin.com/rest/images?action=initializeUpload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'LinkedIn-Version': '202401',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initializeUploadRequest: {
              owner: personUrn,
            },
          }),
        }
      );

      const initData = await initRes.json();
      if (initRes.ok && initData?.value?.uploadUrl) {
        const uploadUrl = initData.value.uploadUrl;
        imageUrn = initData.value.image;

        // PUT binary PNG to uploadUrl
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'image/png',
          },
          body: imageBuffer,
        });
      } else {
        // Fallback: Register upload via v2 assets API
        const v2InitRes = await fetch(
          'https://api.linkedin.com/v2/assets?action=registerUpload',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              registerUploadRequest: {
                recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                owner: personUrn,
                serviceRelationships: [
                  {
                    relationshipType: 'OWNER',
                    identifier: 'urn:li:userGeneratedContent',
                  },
                ],
              },
            }),
          }
        );

        const v2InitData = await v2InitRes.json();
        const uploadMechanism =
          v2InitData?.value?.uploadMechanism?.[
            'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
          ];

        if (uploadMechanism?.uploadUrl) {
          imageUrn = v2InitData.value.asset;
          await fetch(uploadMechanism.uploadUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'image/png',
            },
            body: imageBuffer,
          });
        }
      }
    } catch (mediaErr) {
      console.warn('LinkedIn image upload skipped due to error:', mediaErr);
    }
  }

  // 2. Create the post
  const postPayload = {
    author: personUrn,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  if (imageUrn) {
    postPayload.content = {
      media: {
        title: 'MakeAPost Graphic',
        id: imageUrn,
      },
    };
  }

  const postRes = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': '202401',
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postPayload),
  });

  if (!postRes.ok) {
    // Fallback: v2 UGC post
    const ugcPayload = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text,
          },
          shareMediaCategory: imageUrn ? 'IMAGE' : 'NONE',
          media: imageUrn
            ? [
                {
                  status: 'READY',
                  media: imageUrn,
                  title: { text: 'MakeAPost Graphic' },
                },
              ]
            : undefined,
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const ugcRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ugcPayload),
    });

    const ugcData = await ugcRes.json();
    if (!ugcRes.ok) {
      throw new Error(
        ugcData?.message || 'Failed to publish post to LinkedIn.'
      );
    }

    const postId = ugcData.id || '';
    return {
      success: true,
      postUrl: postId
        ? `https://www.linkedin.com/feed/update/${postId}`
        : 'https://www.linkedin.com/feed/',
    };
  }

  const postHeaderId =
    postRes.headers.get('x-restli-id') || postRes.headers.get('x-linkedin-id');
  const postUrl = postHeaderId
    ? `https://www.linkedin.com/feed/update/${postHeaderId}`
    : 'https://www.linkedin.com/feed/';

  return { success: true, postUrl };
}

// Helper: Publish to X (Twitter)
async function publishToX(connection, text, imageBuffer, admin) {
  const accessToken = await getValidXToken(connection, admin);

  let mediaId = null;

  // 1. Upload Image to X Media Upload Endpoint
  if (imageBuffer) {
    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('media', blob, 'makeapost-screenshot.png');
      formData.append('media_category', 'tweet_image');

      // Attempt v1.1 or v2 media upload with OAuth 2.0 User Token
      let uploadRes = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        uploadRes = await fetch('https://api.x.com/2/media/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });
      }

      const uploadData = await uploadRes.json();
      mediaId = uploadData.media_id_string || uploadData?.data?.id || uploadData.media_id;
    } catch (uploadErr) {
      console.warn('X media upload skipped due to error:', uploadErr);
    }
  }

  // 2. Post Tweet via X API v2
  const tweetPayload = { text };
  if (mediaId) {
    tweetPayload.media = {
      media_ids: [String(mediaId)],
    };
  }

  const tweetRes = await fetch('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tweetPayload),
  });

  const tweetData = await tweetRes.json();

  if (!tweetRes.ok || !tweetData?.data?.id) {
    const errorDetail =
      tweetData?.detail ||
      tweetData?.title ||
      tweetData?.errors?.[0]?.message ||
      'Failed to create tweet on X.';
    throw new Error(errorDetail);
  }

  const tweetId = tweetData.data.id;
  const username = (connection.platform_username || 'i').replace(/^@/, '');
  const postUrl = `https://x.com/${username}/status/${tweetId}`;

  return { success: true, postUrl };
}

export async function POST(request, { params }) {
  try {
    const { platform } = await params;
    const normalizedPlatform = (platform || '').toLowerCase().trim();

    if (!['x', 'linkedin'].includes(normalizedPlatform)) {
      return NextResponse.json(
        { error: `Direct publishing to '${platform}' is not supported.` },
        { status: 400 }
      );
    }

    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in before publishing.' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { text, imageBase64 } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post text content is required.' },
        { status: 400 }
      );
    }

    // Convert imageBase64 to Buffer if present
    let imageBuffer = null;
    if (imageBase64 && typeof imageBase64 === 'string') {
      const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Clean, 'base64');
    }

    // 3. Fetch connected account token
    const admin = createAdminClient();
    const { data: connection, error: dbError } = await admin
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', normalizedPlatform)
      .maybeSingle();

    if (dbError || !connection) {
      return NextResponse.json(
        {
          error: `No connected ${normalizedPlatform.toUpperCase()} account found. Please connect in Settings first.`,
        },
        { status: 404 }
      );
    }

    // 4. Publish
    let result;
    if (normalizedPlatform === 'linkedin') {
      result = await publishToLinkedIn(connection, text.trim(), imageBuffer);
    } else if (normalizedPlatform === 'x') {
      result = await publishToX(connection, text.trim(), imageBuffer, admin);
    }

    return NextResponse.json({
      success: true,
      platform: normalizedPlatform,
      postUrl: result.postUrl,
    });
  } catch (err) {
    console.error('Direct publishing error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while publishing.' },
      { status: 500 }
    );
  }
}
