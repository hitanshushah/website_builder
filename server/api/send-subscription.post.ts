export default defineEventHandler(async (event) => {
    try {
  
      const body = await readBody(event)
      
      // Validate required fields
      if (!body.userEmail) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email is required'
        })
      }
  
      // Use nodemailer to send email
      const { sendMail } = useNodeMailer()
      const config = useRuntimeConfig()
      const brandName = config.public.brandName || 'Website'
      const brandUrl = config.public.brandUrl || 'https://hitanshushah.com'
  
      const emailSubject = `${brandName}: ${body.planName} Subscription Confirmation`
  
      const emailText = `Subscription confirmation for ${body.userName}`
  
      const emailHtml = `
        <h3>New Subscription Confirmation</h3>
        <p><strong>Name:</strong> ${body.userName}</p>
        <p><strong>Email:</strong> ${body.userEmail}</p>
        <p><strong>Plan:</strong> ${body.planName}</p>
        <p>You can now access your ${body.planName} plan and start creating your website.</p>
        <p><strong>To manage your subscription, please visist Manage Membership on Pricing plan page.</strong></p>
        <p>You can cancel your subscription at any time and it will be active until the end of the current billing period.</p>
        <p>To get your payment receipt and invoice, please visit manage membership on the Pricing plan page.</p>
        <p><em>This email was sent from the subscription confirmation on your website.</em></p>
        <p><em>Powered by ${brandName} - <a href="${brandUrl}" target="_blank" rel="noopener noreferrer">${brandUrl}</a></em></p>
      `
  
  
      const result = await sendMail({
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
        to: body.userEmail
      })

      return {
        success: true,
        message: 'Email sent successfully',
        result
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send email'
      })
    }
  })
  