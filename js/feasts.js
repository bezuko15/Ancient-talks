// Feast days for the site's authors. E = Eastern Orthodox (Revised Julian / "New Calendar" date;
// Old Calendar churches keep the same feast 13 days later on the civil calendar). W = Roman Catholic
// (General Roman Calendar or Roman Martyrology). Only well-established dates are listed.
var FEASTS=[
 {m:1,d:1,name:"St Basil the Great",trad:"Eastern Orthodox",author:"basil"},
 {m:1,d:2,name:"St Basil the Great (with St Gregory Nazianzen)",trad:"Roman Catholic",author:"basil"},
 {m:1,d:10,name:"St Gregory of Nyssa",trad:"Eastern Orthodox; Roman Martyrology (since 2001)",author:"gregory"},
 {m:1,d:17,name:"St Anthony the Great, father of the Desert Fathers",trad:"Eastern Orthodox and Roman Catholic",author:"desert"},
 {m:1,d:18,name:"St Athanasius the Great (with St Cyril of Alexandria)",trad:"Eastern Orthodox",author:"athanasius"},
 {m:1,d:28,name:"St Isaac the Syrian",trad:"Eastern Orthodox",author:"isaac"},
 {m:1,d:30,name:"The Three Holy Hierarchs: Sts Basil, Gregory the Theologian and John Chrysostom",trad:"Eastern Orthodox",author:"chrysostom"},
 {m:3,d:18,name:"St Cyril of Jerusalem",trad:"Eastern Orthodox and Roman Catholic",author:"cyril"},
 {m:5,d:2,name:"St Athanasius",trad:"Roman Catholic (also kept in the East)",author:"athanasius"},
 {m:6,d:1,name:"St Justin Martyr",trad:"Eastern Orthodox and Roman Catholic",author:"justin"},
 {m:6,d:15,name:"Blessed Augustine of Hippo",trad:"Eastern Orthodox",author:"augustine"},
 {m:6,d:28,name:"St Irenaeus of Lyons",trad:"Roman Catholic",author:"irenaeus"},
 {m:8,d:23,name:"St Irenaeus of Lyons",trad:"Eastern Orthodox",author:"irenaeus"},
 {m:8,d:28,name:"St Augustine of Hippo",trad:"Roman Catholic",author:"augustine"},
 {m:9,d:13,name:"St John Chrysostom",trad:"Roman Catholic",author:"chrysostom"},
 {m:10,d:17,name:"St Ignatius of Antioch",trad:"Roman Catholic",author:"ignatius"},
 {m:11,d:13,name:"St John Chrysostom",trad:"Eastern Orthodox",author:"chrysostom"},
 {m:11,d:23,name:"St Clement of Rome",trad:"Roman Catholic",author:"clement"},
 {m:11,d:25,name:"St Clement of Rome",trad:"Eastern Orthodox",author:"clement"},
 {m:12,d:4,name:"St John of Damascus",trad:"Eastern Orthodox and Roman Catholic",author:"damascus"},
 {m:12,d:20,name:"St Ignatius of Antioch",trad:"Eastern Orthodox",author:"ignatius"}
];
var FEAST_LINKS={basil:"books/basil-on-the-holy-spirit.html",gregory:"books/gregory-on-the-making-of-man.html",desert:"authors.html#the-desert-fathers",athanasius:"books/athanasius-on-the-incarnation.html",isaac:"shorts.html#ladder-within",chrysostom:"books/chrysostom-on-the-priesthood.html",cyril:"books/cyril-catechetical-lectures.html",justin:"books/justin-first-apology.html",augustine:"books/augustine-confessions.html",irenaeus:"books/irenaeus-against-heresies.html",ignatius:"books/ignatius-ephesians.html",clement:"books/1-clement.html",damascus:"books/john-of-damascus-exact-exposition.html"};
