/** Answer lists for Word Guess (4/5/6 letters) and Hangman (Animals / Movies). */

const split = (s: string) => s.trim().split(/\s+/).map((w) => w.toUpperCase());

export const answers: Record<4 | 5 | 6, string[]> = {
  4: split(`
    able acid aged also area army away baby back ball band bank base bath bear beat bell best bird blue boat body bone book born both
    calm card care cart case cash cell city clay club coat code cold come cook cool copy corn cost crew dark data date dawn deal dear
    deep desk door down draw drop dust duty earn east easy edge else even ever face fact fair fall farm fast fear feel fern film find
    fine fire firm fish flag flat flow folk food foot form free frog full fund gain game gate gift girl glad goal gold golf good grow
    hair half hall hand hard harp head heat help hero high hill hold home hope horn hour huge idea iron isle jazz join joke jump keen
    kind king kite knot lake lamp land lane last late leaf lean left lens life lift like line link lion list live load lock long look
    lord love luck made mail main make map mark meal mild milk mind mint mode moon more most move much name navy near neat nest news
    nice note open oval pace page pain pair palm park pass path peak pine pink plan play plot plum poem pond pool port pure quiz rain
    read real rest rice rich ride ring rise road rock roof room root rope rose ruby safe sail salt sand save seed ship shoe shop side
    sign silk sing sink size snow soft soil song soul star stay step stem sure swim tale tall team tide tile time tiny tone tree trip
    true tune unit vast view vote wall warm wave west wide wild wind wing wise wish wolf wood word work yard year zero zone`).filter((w) => w.length === 4),
  5: split(`
    about above actor adapt adore after again agent agree alarm album alert alike alive allow alone amber angel apple april arena arise
    award aware bacon badge baker basic beach bench berry birth black blank blend bloom blues board bonus brave bread brick bride brief
    bring broad brown brush build cabin camel candy cargo carry chair chalk charm chart chase cheap check chess chief child chord cider
    civic claim class clean clear climb clock cloud coach coast coral couch count court cover craft crane cream crisp crown curve cycle
    daily dance delta depth diary dinner dream dress drink drive eager eagle early earth eight elbow elder empty enjoy equal event exact
    extra faith fancy feast fence field fifty final flame flash fleet float flock flour fluid focus forge forty frame fresh front frost
    fruit giant glass globe glory grace grain grand grape graph grass great green grove guard guess guide habit happy harbor heart heavy
    hello honey horse hotel house human humor ideal image index input irony ivory jelly jewel juice knife label large laser later laugh
    layer learn lemon level light linen local lodge lucky lunar magic major maple march match mayor medal melon metal minor mirror model
    money month motor mount mouse mouth music nerve never night noble north novel nurse ocean offer olive onion opera orbit order other
    outer owner paint panel paper party pasta patch peace peach pearl pedal phone photo piano pilot pitch pixel place plain plane plant
    plate point polar power press pride prime print prize proud puzzle quiet quilt radio raise range rapid raven reach ready relax river
    robin robot round royal salad scale scene scout shade shape share sharp shelf shell shine shirt shore short skill skirt slate sleep
    slice smile smoke snack solar solid sound south space spare spark speak spice spine spoon sport squad stack stage stair stamp stand
    start steam steel stick stone storm story stove sugar sunny swing table taste teach thank theme thick thumb tiger toast topic torch
    total tower track trade trail train treat trend tribe truck trust truth tulip uncle union upper urban usual valid value vapor video
    vital vivid voice wagon waltz watch water whale wheat wheel white whole woman world worth wrist write yacht yield young youth zebra`).filter((w) => w.length === 5),
  6: split(`
    across action active advice almost always animal answer anyone appear around arrive artist autumn barely basket beauty before behind
    better beyond bridge bright broken bubble budget butter button camera candle canvas carbon carpet castle center chance change charge
    choice circle client coffee colour common corner cotton cousin create credit custom dancer debate decide degree design detail dinner
    direct divide doctor dollar double dragon driver easily editor effect effort eleven empire energy engine enough escape estate evening
    expert family famous farmer father figure finger finish flight flower follow forest forget friend frozen future galaxy garden gentle
    ginger global golden ground growth guitar hammer handle harbor health heaven helmet hidden honest hunter island jacket jungle kitten
    ladder launch leader legend lesson letter little lizard lovely magnet market master meadow memory method middle minute mirror modern
    moment monkey mother motion museum nature nearby needle number object office orange orchid oyster palace parent pencil pepper person
    pickle planet player pocket poetry potato puzzle rabbit random reason record repair rhythm rocket salmon school screen season secret
    shadow silver simple singer sister smooth spirit spring square stream street string studio summer sunset system tablet teapot temple
    thirty ticket timber tomato travel turtle twenty unique valley velvet violin vision wallet walnut winter wisdom wonder yellow zipper`).filter((w) => w.length === 6),
};

export const hangmanWords: Record<"animals" | "movies", string[]> = {
  animals: split(`
    elephant giraffe kangaroo penguin dolphin octopus cheetah leopard gorilla hedgehog flamingo crocodile butterfly chameleon squirrel
    rhinoceros hippopotamus porcupine armadillo jellyfish lobster panther buffalo mongoose ostrich peacock pelican raccoon reindeer
    scorpion seahorse tortoise walrus wombat koala lemur meerkat narwhal otter platypus salamander sloth toucan vulture zebra badger
    beaver camel falcon gazelle hamster iguana jaguar`),
  movies: [
    "TOY STORY", "FINDING NEMO", "THE LION KING", "SPIRITED AWAY", "INSIDE OUT", "UP", "COCO", "FROZEN", "MOANA", "RATATOUILLE",
    "WALL E", "THE INCREDIBLES", "JURASSIC PARK", "STAR WARS", "BACK TO THE FUTURE", "THE MATRIX", "INCEPTION", "INTERSTELLAR",
    "TITANIC", "AVATAR", "BLACK PANTHER", "THE AVENGERS", "SPIDER MAN", "HARRY POTTER", "THE HOBBIT", "SHREK", "KUNG FU PANDA",
    "ZOOTOPIA", "BIG HERO SIX", "THE GODFATHER", "JAWS", "ROCKY", "GLADIATOR", "CASABLANCA", "PARASITE", "PADDINGTON", "MADAGASCAR",
    "THE LEGO MOVIE", "ENCANTO", "CARS",
  ],
};
