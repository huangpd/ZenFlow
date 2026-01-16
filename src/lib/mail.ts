import nodemailer from 'nodemailer';

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || '"ZenFlow" <noreply@zenflow.com>',
    to: email,
    subject: '验证您的邮箱 · 个人 AI 灵性伴侣',
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>验证您的邮箱 · 个人 AI 灵性伴侣</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; color:#333;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7f6; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.05); overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px; background:linear-gradient(135deg,#e8f0ec,#f7faf8);">
              <h1 style="margin:0; font-size:22px; font-weight:600; color:#2f4f4f;">
                您的个人 AI 灵性伴侣
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#5f7a73;">
                助力正念与成长
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 40px; line-height:1.7;">
              <p style="margin:0 0 16px; font-size:16px;">
                你好，
              </p>

              <p style="margin:0 0 20px;">
                欢迎你开始这段温柔而清醒的旅程。  
                在继续之前，请先完成邮箱验证，以确保这是你的真实地址。
              </p>

              <!-- Verification Code -->
              <div style="margin:28px 0; text-align:center;">
                <p style="margin:0 0 8px; color:#777; font-size:14px;">
                  你的验证码
                </p>
                <div style="display:inline-block; padding:14px 28px; font-size:24px; letter-spacing:4px; font-weight:600; color:#2f4f4f; background-color:#eef4f1; border-radius:8px;">
                  ${token}
                </div>
                <p style="margin:10px 0 0; font-size:12px; color:#999;">
                  验证码将在 60 分钟后失效
                </p>
              </div>

              <!-- Or Button -->
              <p style="margin:32px 0 12px; font-size:14px; color:#777;">
                或者，你也可以直接点击下方按钮完成验证：
              </p>

              <div style="text-align:center; margin:20px 0 32px;">
                <a href="${confirmLink}" target="_blank"
                   style="display:inline-block; padding:14px 32px; background-color:#4f766f; color:#ffffff; text-decoration:none; border-radius:24px; font-size:15px;">
                  验证我的邮箱
                </a>
              </div>

              <hr style="border:none; border-top:1px solid #eee; margin:32px 0;" />

              <!-- Features -->
              <h3 style="margin:0 0 16px; font-size:16px; color:#2f4f4f;">
                你将获得：
              </h3>

              <ul style="padding-left:18px; margin:0; color:#555; font-size:14px;">
                <li style="margin-bottom:10px;">
                  <strong>灵性对话</strong>：与 AI 进行深度交流，获取关于经典和人生的见解
                </li>
                <li style="margin-bottom:10px;">
                  <strong>正念练习</strong>：通过每日任务和冥想计时器，培养内在的平静
                </li>
                <li>
                  <strong>成长记录</strong>：记录你的灵性随笔，见证每一步心灵的蜕变
                </li>
              </ul>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; background-color:#fafafa; font-size:12px; color:#999;">
              <p style="margin:0 0 8px;">
                如果你并未注册此服务，请忽略这封邮件。
              </p>
              <p style="margin:0;">
                愿你安住当下，清明前行。
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  };

  try {
    console.log('----------------------------------------------');
    console.log('Confirmation Link:', confirmLink);
    console.log('----------------------------------------------');
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // don't throw, just log to allow registration flow to "complete" even if email fails?
    // or arguably we should let the caller know.
    // For now, let's bubble up implicitly or just log.
    // Since we await this in the action, it might break the flow if it throws.
    // I will throw to inform the user that email failed.
    throw new Error('Could not send verification email');
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || '"ZenFlow" <noreply@zenflow.com>',
    to: email,
    subject: '重置您的密码 · 个人 AI 灵性伴侣',
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>重置您的密码 · 个人 AI 灵性伴侣</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; color:#333;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7f6; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.05); overflow:hidden;">
          <tr>
            <td style="padding:32px 40px; background:linear-gradient(135deg,#e8f0ec,#f7faf8);">
              <h1 style="margin:0; font-size:22px; font-weight:600; color:#2f4f4f;">
                您的个人 AI 灵性伴侣
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#5f7a73;">
                助力正念与成长
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px; line-height:1.7;">
              <p style="margin:0 0 16px; font-size:16px;">
                你好，
              </p>
              <p style="margin:0 0 20px;">
                我们收到了重置您 ZenFlow 账号密码的请求。
                如果这不是您本人操作，请忽略此邮件。
              </p>
              <p style="margin:32px 0 12px; font-size:14px; color:#777;">
                请点击下方按钮重置密码（1小时内有效）：
              </p>
              <div style="text-align:center; margin:20px 0 32px;">
                <a href="${resetLink}" target="_blank"
                   style="display:inline-block; padding:14px 32px; background-color:#4f766f; color:#ffffff; text-decoration:none; border-radius:24px; font-size:15px;">
                  重置密码
                </a>
              </div>
              <hr style="border:none; border-top:1px solid #eee; margin:32px 0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px; background-color:#fafafa; font-size:12px; color:#999;">
              <p style="margin:0;">
                愿你安住当下，清明前行。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  try {
    console.log('----------------------------------------------');
    console.log('Reset Link:', resetLink);
    console.log('----------------------------------------------');
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email');
  }
};
