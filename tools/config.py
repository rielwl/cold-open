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

# The Sprint angles and Paper lenses live in prompts.js at the repo root.
print("config ok:", len(DOMAINS), "domains")
