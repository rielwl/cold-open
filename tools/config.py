# -*- coding: utf-8 -*-
# Featured-article heading -> domain. Headings not listed here are dropped:
# sports, warships, battles, albums, songs, TV, video games, fiction.
DOMAINS = {
 "Life & evolution": ["Birds","Mammals and stem mammals","Fungi","Plants",
   "Non-avian dinosaurs","Invertebrates","Reptiles and amphibians","Fish",
   "Biology","Biology biographies"],
 "Mind & behaviour": ["Philosophy and psychology","Philosophy and psychology biographies"],
 "Physics & space": ["Astronomical objects and other space entities",
   "Physics and astronomy","Physics and astronomy biographies","Elements"],
 "Earth & climate": ["Geology and geophysics","Geology and geophysics biographies",
   "Landforms","Bodies of water and water formations","Storms","Meteorology and climate",
   "Islands","National and state parks, nature reserves, conservation areas, and countryside routes",
   "Other places"],
 "Chemistry & materials": ["Chemistry and mineralogy","Chemistry and mineralogy biographies","Compounds"],
 "Maths & computing": ["Mathematics","Biographies of mathematicians","Computing"],
 "Medicine & the body": ["Medical conditions and management","Health and medicine","Medical biographies"],
 "Engineering & built things": ["Engineering and technology","Engineering and technology biographies",
   "Road infrastructure","Railways, rail bridges, tunnels, and stations","Architecture",
   "Maritime transport","Air transport","Trains and locomotives"],
 "History & archaeology": ["History","Archaeology","History biographies","Funerary art and memorials",
   "Numismatics","Heraldry, honors, and vexillology"],
 "Society, law & money": ["Politics and government","Law","Law biographies",
   "Business, economics, and finance","Culture and society","Education",
   "Countries, regions and political entities","Cities, towns and villages"],
 "Language & culture": ["Language and linguistics","Language biographies",
   "Religion, mysticism and mythology","Religion, mysticism and mythology biographies",
   "Food and drink","Clothing and fashion"],
 "Art & design": ["Art","Paintings","Biographies (art, architecture, and archaeology)"],
}
PREFIX_DOMAINS = {}  # century headings on the FA page are film/TV by decade, not history

# Topic mode: the angle you must take. This is what stops every draw feeling the same.
SHAPES = [
 ("The mechanism","How does this actually work, step by step? Push until you hit the part that still isn't understood."),
 ("The turn","This was standard, and then it abruptly wasn't. What changed, who resisted, and who was right?"),
 ("The wrong number","Something here was measured, accepted, and later found wrong. How was it caught?"),
 ("Convergent solutions","Find somewhere else \u2014 another field, species, or century \u2014 that solved this the same way, independently."),
 ("The edge case","Where does this break down? The failure mode usually defines the thing better than the success case."),
 ("Who benefits","Follow the incentives. Who gained from it being this way, and who paid for it?"),
 ("The stubborn one","This exists because somebody refused to let it go. Tell it from their side."),
 ("Scale it","What happens at a thousand times bigger, or smaller? Find what stops working and why."),
 ("The open question","Go straight to what nobody can explain yet, and lay out the best current guesses fairly."),
 ("Before and after","Reconstruct, honestly and without smugness, what people believed immediately before this."),
 ("The trade-off","Nothing came free. What was given up to get this, and was it worth it?"),
 ("The accident","Find the unintended consequence, the mistake, or the side effect that mattered more than the plan."),
 ("How do we even know","Interrogate the method, not the claim. What would you have to trust to believe this?"),
 ("The near miss","There was a version of this that almost happened instead. Why didn't it?"),
 ("Borrowed","Trace this back to the completely unrelated field it was lifted from."),
 ("The boring part","Find the unglamorous thing everything else quietly depends on."),
]

# Paper mode: a lens to read through, so you're not both just nodding along.
LENSES = [
 ("What would have changed their mind","Find the result that would have falsified this. Did they go looking for it?"),
 ("The one figure","Pick the single figure the whole paper rests on. Try to redraw it from memory afterwards."),
 ("Methods first","Read the methods before the results, and write down what you predict they found."),
 ("The leap","Mark the exact sentence where the data stops and the interpretation starts."),
 ("A sample of what","Who or what was actually studied \u2014 and what does that honestly let them claim?"),
 ("The experiment they didn't run","What's the obvious next study, and why do you think it isn't in here?"),
 ("No jargon","Explain the finding to each other in one sentence, out loud, using no technical words."),
 ("The number that matters","Find the effect size. Set aside significance \u2014 is it big enough to care about?"),
]
print("config ok:", len(DOMAINS), "domains,", len(SHAPES), "shapes,", len(LENSES), "lenses")
