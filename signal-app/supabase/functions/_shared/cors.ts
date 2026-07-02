// Personal-use MVP: allow any origin. Tighten to APP_URL once SIGNAL has a
// fixed deployed domain.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
