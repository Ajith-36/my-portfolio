const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/send", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // PDF உருவாக்கும்
  const doc = new PDFDocument();
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", async () => {
    const pdfData = Buffer.concat(buffers);

    // Nodemailer setup
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      attachments: [
        {
          filename: "contact.pdf",
          content: pdfData,
        },
      ],
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Error sending email." });
      }
      res.json({ success: true, message: "Email sent with PDF!" });
    });
  });

  doc.fontSize(20).text("Contact Form Submission", { underline: true });
  doc.moveDown();
  doc.fontSize(14).text(`Name: ${name}`);
  doc.text(`Email: ${email}`);
  doc.text(`Subject: ${subject}`);
  doc.text(`Message: ${message}`);
  doc.end();
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
