export async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!token) {
    return { success: false, error: 'Missing Turnstile token' };
  }
  
  if (!secretKey) {
    console.error('Turnstile Secret Key is not configured');
    // Fail closed or open depending on preference. Usually fail closed for security.
    return { success: false, error: 'Server configuration error' };
  }

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: 'Turnstile verification failed' };
    }
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return { success: false, error: 'Failed to validate Turnstile token' };
  }
}
