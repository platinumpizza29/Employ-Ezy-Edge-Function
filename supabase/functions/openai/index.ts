import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { CreateCompletionRequest } from "https://esm.sh/openai@3.1.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = "https://fifengrdapbvegoaaqdg.supabase.co/";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZmVuZ3JkYXBidmVnb2FhcWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5MDMwNDAsImV4cCI6MjAxODQ3OTA0MH0.XnrjvUM64oUvwG9sCl4VNsZg6b_FDdu5l7-kbL-cW-Q";
const supabase = createClient(PROJECT_URL, API_KEY);

Deno.serve(async req => {
  const query = await req.json();

  const completionConfig: CreateCompletionRequest = {
    model: "gpt-3.5-turbo-instruct",
    prompt: `give feed back on this ${query.record.code} and provide a rating out of 10. Please follow this json format for your responses - {evaluation: "", rating n/10}`,
    max_tokens: 256,
    temperature: 0,
    stream: false
  };

  // return new Response("ok");
  const api = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(completionConfig)
  });

  if (api.body) {
    const evaluation = await api.json()
    let finalEval = ""
    finalEval = evaluation.choices[0].text
    const resultData = {
      candidate_id: query.record.candidate_id,
      submission_id: query.record.submission_id,
      evaluation: finalEval,
    }

    const { data, error } = await supabase
      .from('CandidateSubmissions')
      .update({ ai_evaluation: resultData.evaluation })
      .eq('candidate_id', resultData.candidate_id)
      .eq('submission_id', resultData.submission_id)
      .select()

    console.log(error)
  }

  return new Response("ok")
});
