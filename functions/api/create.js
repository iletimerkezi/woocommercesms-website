export async function onRequestPost({request}) {

  let form        = await request.json()
  const signupRsp = await createAccount(form)

  if(signupRsp.status === 500) {
    return errorRsp(['Please try later.'])
  }

  let signup = await signupRsp.json()
  let errors = parseSignupResponse(signup);

  if(errors.length > 0) {
    return errorRsp(errors)
  }

  let isEmailValid = form.email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  if(! isEmailValid) {
    return errorRsp(['Email adresinizi doğrulayamadık.'])
  }

  const emailRsp = await sendEmail(form)
  if(! emailRsp.ok) {
    return errorRsp(['Epostayı gönderemedik, lütfen tekrar deneyin.'])
  }

  return new Response(JSON.stringify({
    success: true,
  }), {
    status: 200,
    headers: {
      "content-type": "application/json"
    },
  })
}

function parseSignupResponse(response) {
  let falseFlag      = "Bu cep telefonu numarası kullanımda, giriş yapmak için şifrenizi yenileyebilirsiniz."
  let errorContainer = [];

  for(const err in response.data?.error) {
    if(err.includes('is_')) {
      continue
    }

    if(response.data?.error[err] === falseFlag) {
      continue
    }

    errorContainer.push(response.data.error[err]);
  }

  return errorContainer
}

function errorRsp(errors) {
  return new Response(JSON.stringify({
    success: false,
    errNo: 422,
    errors: errors
  }), {
    status: 422,
    header: {
      "content-type": "application/json"
    }
  })
}

async function createAccount(form) {

  return fetch('https://www.iletimerkezi.com/new/panel/auth/signup', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      aggrement: true,
      gsm: form.gsm,
      name_surname: form.name_surname,
      password: form.password,
      ref: "woocommercesms.com",
      type:	"kurumsal"
    })
  })
}

async function sendEmail(form) {

  let trContent = `
    Merhaba,
    <br />
    <br />
    Woocommerce SMS eklentiyi indirmek için <a href="https://woocommercesms.com/iletimerkezi-notify.zip">tıklayınız.</a>
    <br />
    <br />
    Kurulum aşamasında herhangi bir problem yaşarsanız, bizimle <b>0212-543-4210</b> veya
    <b>
      <a href="mailto:destek@emarka.com.tr">
        destek@emarka.com.tr
      </a>
    </b> iletişime geçebilirsiniz.
  `

  let enContent = `
    Hello,
    <br />
    <br />
    Click <a href="https://woocommercesms.com/iletimerkezi-notify.zip">to download the Woocommerce SMS plugin.</a>
    <br />
    <br />
    If you have any problems during installation, contact us at <b>0212-543-4210</b> or
    <b>
      <a href="mailto:support@emarka.com.tr">
        support@emarka.com.tr
      </a>
    </b> you can contact us.
  `

  let trSubject = 'WooCommerce SMS Eklenti Kurulum Bilgileri';
  let enSubject = 'Woocommerce SMS Addon Setup Information';

  return fetch(new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: form.email, name: form.name_surname }],
          },
        ],
        from: {
          email: 'no-reply@woocommercesms.com',
          name: 'Woocommerce SMS',
        },
        subject: form.lang === 'tr' ? trSubject : enSubject,
        content: [
          {
            type: 'text/html',
            value: form.lang === 'tr' ? trContent : enContent,
          },
        ],
      }),
  }))
}