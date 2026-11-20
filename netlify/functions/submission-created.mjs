// Netlify runs this after every verified (non-spam) form submission on ndeavour.ca.
// It hands "inquiry" enquiries straight to the N-Deavour CRM as leads.
//
// Only the four fields the form asks for are sent. The IP address, browser and referrer
// that Netlify records are not. Nothing personal is written to the function log.
//
// Needs one environment variable in Netlify (Project configuration → Environment variables):
//   CRM_LEADS_API_KEY  a CRM key with only "Add new leads" ticked (CRM → Settings → Integrations)
// Every submission also stays in Netlify Forms, so nothing is lost if the CRM is unreachable.

const CRM_URL = 'https://ubyqsitfvxciztsleyyw.supabase.co/functions/v1/api-inbound/leads';

// Form values → the CRM's service names.
const INTEREST = {
  audit: 'AI Readiness & Data Privacy Audit',
  automation: 'Workflow Automation',
  'privacy-program': 'Privacy Management Program',
  training: 'Staff AI Readiness & Safety Training',
  policy: 'Staff AI Use Policy',
  'care-plan': 'Care Plan or Privacy Officer on Call',
  unsure: 'Not sure yet',
};

const text = (v, max) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined);

async function send(key, lead) {
  const res = await fetch(CRM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'x-region': 'ca-central-1' },
    body: JSON.stringify(lead),
    signal: AbortSignal.timeout(4000),
  });
  let result = {};
  try { result = await res.json(); } catch { /* no body */ }
  return { status: res.status, result };
}

export async function handler(event) {
  let submission;
  try {
    submission = JSON.parse(event.body || '{}').payload || {};
  } catch {
    return { statusCode: 400, body: 'Bad payload' };
  }
  if (submission.form_name !== 'inquiry') return { statusCode: 200, body: 'Not a CRM form' };

  const key = process.env.CRM_LEADS_API_KEY;
  if (!key) {
    console.error('CRM_LEADS_API_KEY is not set: enquiry kept in Netlify Forms only.');
    return { statusCode: 200, body: 'CRM not configured' };
  }

  const d = submission.data || {};
  const lead = {
    full_name: text(d.full_name, 160),
    email: text(d.biz_email, 200),
    service_interest: INTEREST[d.service_interest],
    message: text(d.bottleneck, 2000),
    source: 'Website form',
  };

  try {
    let { status, result } = await send(key, lead);
    // The CRM refuses card numbers and SINs. Keep the lead, leave the message in Netlify Forms.
    if (status === 422 && lead.message) {
      ({ status, result } = await send(key, {
        ...lead,
        message: 'Their message was left out because the CRM flagged it. Read it in Netlify Forms.',
      }));
    }
    // One retry for a server hiccup.
    if (status >= 500) ({ status, result } = await send(key, lead));

    if (status === 201) {
      console.log(`Lead sent to CRM: client ${result.client_number}${result.existing ? ' (existing contact)' : ''}`);
    } else {
      console.error(`CRM did not accept the enquiry: HTTP ${status}. It is still in Netlify Forms.`);
    }
  } catch (e) {
    console.error(`Could not reach the CRM (${e.name}). The enquiry is still in Netlify Forms.`);
  }
  // Always 200: the submission itself is safe in Netlify Forms either way.
  return { statusCode: 200, body: 'ok' };
}
