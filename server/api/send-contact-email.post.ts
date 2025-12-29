export default defineEventHandler(async (event) => {
  try {

    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and email are required'
      })
    }

    // Fetch user email if userId is provided
    let userEmail = null
    if (body.userId) {
      try {
        const response = await $fetch<{
          success: boolean
          email: string | null
          override_email: boolean | null
          has_secondary_email: boolean
        }>('/api/user-email', {
          query: { userId: body.userId }
        })

        if (response.success) {
          userEmail = response.email
        }
      } catch (error) {
        console.error('Failed to fetch user email:', error)
      }
    }

    // Use nodemailer to send email
    const { sendMail } = useNodeMailer()
    const config = useRuntimeConfig()
    const brandName = config.public.brandName || 'Website'
    const brandUrl = config.public.brandUrl || 'https://hitanshushah.com'

    const emailSubject = body.subject
      ? `${brandName} Contact Form Submission: ${body.subject}`
      : `${brandName} Contact Form Submission`

    const emailText = body.message || `Contact form submission from ${body.name}`

    const emailHtml = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${body.name}</p>
      <p><strong>Email:</strong> ${body.email}</p>
      ${body.message ? `<p><strong>Message:</strong></p><p>${body.message}</p>` : ''}
      <p><em>This email was sent from the contact form on your website.</em></p>
      <p><em>Powered by ${brandName} - <a href="${brandUrl}" target="_blank" rel="noopener noreferrer">${brandUrl}</a></em></p>
    `


    const result = await sendMail({
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      to: userEmail
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
