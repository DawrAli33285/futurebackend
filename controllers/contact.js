const nodemailer = require('nodemailer');
const newsletterModel = require('../models/newsletter');




module.exports.contactUsEmail = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
         user: process.env.EMAIL_USER || 'lemightyeagle@gmail.com',
        pass: process.env.EMAIL_PASS || 'uhrkgdguezzjduul'
        }
      });
    const { name, email, subject, message } = req.body;

  
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

  
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            color: #667eea;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .section-content {
            color: #333;
            font-size: 15px;
            line-height: 1.6;
          }
          .info-box {
            background: #f8f9ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .info-label {
            color: #667eea;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            color: #333;
            font-size: 15px;
            margin-top: 5px;
            word-break: break-word;
          }
          .message-box {
            background: #fafbff;
            border: 1px solid #e0e4ff;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          .message-content {
            color: #333;
            font-size: 15px;
            line-height: 1.8;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            background: #f8f9ff;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e0e4ff;
          }
          .footer p {
            color: #666;
            font-size: 13px;
            margin: 5px 0;
          }
          .footer-logo {
            font-size: 12px;
            color: #667eea;
            font-weight: 600;
          }
          .star {
            color: #ffd700;
            margin: 0 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>✨ New Contact Form Submission</h1>
            <p>A visitor has reached out from your astrology website</p>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Contact Information -->
            <div class="section">
              <div class="info-box">
                <div class="info-label">📝 Name</div>
                <div class="info-value">${name}</div>
              </div>

              <div class="info-box">
                <div class="info-label">✉️ Email</div>
                <div class="info-value"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></div>
              </div>

              <div class="info-box">
                <div class="info-label">⭐ Subject</div>
                <div class="info-value">${subject}</div>
              </div>
            </div>

            <!-- Message -->
            <div class="section">
              <div class="section-title">💬 Message</div>
              <div class="message-box">
                <div class="message-content">${message}</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-logo"><span class="star">🌙</span>Astrology Portal<span class="star">⭐</span></p>
            <p>Reply to this email or use the contact information above to get back to the visitor.</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

   
    await transporter.sendMail({
      from: 'lemightyeagle@gmail.com',
      to: 'Buchanandrea@gmail.com',
      subject: `New Contact Form: ${subject}`,
      html: htmlTemplate,
      replyTo: email
    });

   
    const userConfirmationTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We Received Your Message</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .content p {
            color: #333;
            font-size: 15px;
            line-height: 1.8;
            margin-bottom: 15px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
          }
          .footer {
            background: #f8f9ff;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e0e4ff;
          }
          .footer p {
            color: #666;
            font-size: 13px;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Message Received</h1>
            <p>Thank you for contacting us</p>
          </div>

          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>We have successfully received your message and appreciate you reaching out to us. Our team will review your inquiry and get back to you as soon as possible.</p>
            
            <p><strong>Subject:</strong> ${subject}</p>
            
            <p>In the meantime, feel free to explore our website and discover the cosmic insights we have to offer.</p>
          </div>

          <div class="footer">
            <p>🌙 Astrology Portal ⭐</p>
            <p>Guided by the stars, inspired by your destiny</p>
          </div>
        </div>
      </body>
      </html>
    `;

   
    await transporter.sendMail({
      from: 'lemightyeagle@gmail.com',
      to: email,
      subject: 'We Received Your Message - Astrology Portal',
      html: userConfirmationTemplate
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully"
    });

  } catch (e) {
    console.log(e.message);
    return res.status(400).json({
      error: "Error occured while trying to send email"
    });
  }
};


module.exports.joinNewsLetter=async(req,res)=>{
    let {...data}=req.body;
    try{
        let alreadyJoined=await newsletterModel.findOne({email:data.email})
        if(alreadyJoined){
            return res.status(400).json({
                error:"News letter already joined"
            })
        }
await newsletterModel.create(data)
return res.status(200).json({
    message:"News letter joined sucessfully"
})
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Error occured while joining news letter"
        })
    }
}