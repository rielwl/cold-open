// Sprint guiding questions and Paper reading lenses. Plain data: add a line, reload.
//
// Sprint: each card gets one question from each group, in order, so every set
// runs what-is-it -> how -> why it matters -> the twist -> what's open. Five
// questions, one per talk card. Questions must work for any subject: a person,
// a place, a species, a machine, an idea.
//
// Paper: a lens with needs:"data" is only dealt for papers that report their own
// measurements, so "find the effect size" never lands on a theory paper.
window.PROMPTS = {
questions: [
 {g:"Ground it", q:[
  "What is it, in one sentence a friend would understand?",
  "Where and when does it sit? What's the one fact that places it?",
  "If you could hold up one picture or object for it, what would it be?",
  "What would people most likely confuse it with, and how is it different?",
  "Who or what are the main players involved?",
  "Where does the name come from, and does it fit?"
 ]},
 {g:"How it works", q:[
  "How does it actually work, step by step?",
  "How did it come about? What happened first, and what made the rest follow?",
  "What had to be true for it to exist at all?",
  "What changed it over time, and what stayed the same?",
  "How do we know what we know about it, and how good is that evidence?",
  "What's the one decision or mechanism everything else depends on?"
 ]},
 {g:"Why it matters", q:[
  "Why should anyone who isn't an expert care?",
  "Who gained from it, and who paid for it?",
  "What would be different if it had never existed or happened?",
  "What did it replace, or what replaced it?",
  "Where does it touch everyday life, even indirectly?",
  "What did it cost, in money, lives, time or effort, and was it worth it?"
 ]},
 {g:"The twist", q:[
  "What's the most surprising thing you found?",
  "What do most people believe about it that turns out to be wrong?",
  "What went wrong, nearly went wrong, or had an effect nobody planned?",
  "What's the strangest detail you'd tell a friend first?",
  "Where does it connect to something completely unrelated?",
  "Who is the unexpected person in this story, and what did they do?"
 ]},
 {g:"What's open", q:[
  "What's still unknown, disputed or unresolved?",
  "What would you ask an expert if you had five minutes with them?",
  "Where do your sources disagree, and which do you believe?",
  "What happens next? Where is it heading?",
  "What would change your mind about the main thing you've learned?",
  "If you had another hour, what would you chase?"
 ]}
],
lenses: [
 {n:"What would have changed their mind", p:"Find the result that would have falsified this. Did they go looking for it?"},
 {n:"The one figure", p:"Pick the single figure the whole paper rests on. Try to redraw it from memory afterwards."},
 {n:"Methods first", p:"Read the methods before the results, and write down what you predict they found.", needs:"data"},
 {n:"The leap", p:"Mark the exact sentence where the data stops and the interpretation starts."},
 {n:"A sample of what", p:"Who or what was actually studied — and what does that honestly let them claim?", needs:"data"},
 {n:"The experiment they didn't run", p:"What's the obvious next study, and why do you think it isn't in here?"},
 {n:"No jargon", p:"Explain the finding to each other in one sentence, out loud, using no technical words."},
 {n:"The number that matters", p:"Find the effect size. Set aside significance — is it big enough to care about?", needs:"data"},
 {n:"Referee", p:"One of you is the reviewer who wants it rejected, the other the author. Swap halfway through the talk."},
 {n:"Headline", p:"Each write the newspaper headline this deserves, and the one it would actually get. Compare."},
 {n:"Would you fund it", p:"You have the grant money. Would you pay for this again, knowing the result? What would you cut?"},
 {n:"So what for us", p:"Find one thing in here that should change how either of you actually lives, votes or spends. Or argue nothing should."}
],
// Printed on the handout when Claude's own "talk about" questions aren't available.
talk: [
 "What did each of you think they'd find, before reading the results?",
 "Which sentence would you quote to a friend, and which would you cross out?",
 "Who would be annoyed if this turned out to be true?",
 "What's the one question you'd ask the authors if they walked in now?"
]
};
