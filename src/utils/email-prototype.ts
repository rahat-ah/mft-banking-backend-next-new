export const sendSignupMailHtml = (name : string) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 15px; text-align: center;">
          <h2 style="margin: 0;">Welcome to MFT Banking 🎉</h2>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Hello <strong>Dear ${name}</strong>,</p>
          <p>Thank you for signing up to <strong>MFT</strong> system. You are now part of Messrs Famous Traders Banking</p>
        </div>
        <div style="background:#f1f1f1; text-align:center; padding:10px; font-size:12px; color:#777;">
          <p>© ${new Date().getFullYear()} MFT||Banking . All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};