// The angles (Sprint) and reading lenses (Paper). Plain data: add a line, reload.
// A lens with needs:"data" is only dealt for papers that report their own
// measurements, so "find the effect size" never lands on a theory paper.
window.PROMPTS = {
shapes: [
 {n:"The mechanism", p:"How does this actually work, step by step? Push until you hit the part that still isn't understood."},
 {n:"The turn", p:"This was standard, and then it abruptly wasn't. What changed, who resisted, and who was right?"},
 {n:"The wrong number", p:"Something here was measured, accepted, and later found wrong. How was it caught?"},
 {n:"Convergent solutions", p:"Find somewhere else — another field, species, or century — that solved this the same way, independently."},
 {n:"The edge case", p:"Where does this break down? The failure mode usually defines the thing better than the success case."},
 {n:"Who benefits", p:"Follow the incentives. Who gained from it being this way, and who paid for it?"},
 {n:"The stubborn one", p:"This exists because somebody refused to let it go. Tell it from their side."},
 {n:"Scale it", p:"What happens at a thousand times bigger, or smaller? Find what stops working and why."},
 {n:"The open question", p:"Go straight to what nobody can explain yet, and lay out the best current guesses fairly."},
 {n:"Before and after", p:"Reconstruct, honestly and without smugness, what people believed immediately before this."},
 {n:"The trade-off", p:"Nothing came free. What was given up to get this, and was it worth it?"},
 {n:"The accident", p:"Find the unintended consequence, the mistake, or the side effect that mattered more than the plan."},
 {n:"How do we even know", p:"Interrogate the method, not the claim. What would you have to trust to believe this?"},
 {n:"The near miss", p:"There was a version of this that almost happened instead. Why didn't it?"},
 {n:"Borrowed", p:"Trace this back to the completely unrelated field it was lifted from."},
 {n:"The boring part", p:"Find the unglamorous thing everything else quietly depends on."},
 {n:"The money", p:"Who paid for this, what did it cost, and what did the money buy that nothing else could?"},
 {n:"The rival", p:"Find the competing idea, person or design that lost. Make the strongest case that it should have won."},
 {n:"Ask a child", p:"Answer the question a curious ten-year-old would ask first — the one experts skip because it seems too obvious."},
 {n:"The object", p:"Build the talk around one physical thing you could hold up: a tool, a specimen, a document, a part."}
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
