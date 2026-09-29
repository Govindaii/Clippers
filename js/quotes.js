/*
 * Quote library + offline generator.
 *
 * Every quote here is original to this project, so you can post them as your own.
 * Add your own lines to the arrays below: one string per quote, "\n\n" makes a new paragraph.
 *
 * Works in the browser (window.QuoteEngine) and in Node (require) so tests can use it.
 */
(function (root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) module.exports = engine;
  else root.QuoteEngine = engine;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const CATEGORIES = {
    growth: "Growth",
    discipline: "Discipline",
    relationships: "Relationships",
    money: "Money",
    career: "Career & Business",
    selfworth: "Self-worth",
    lonely: "Lonely Phase",
    failure: "Failure",
    creator: "Creators",
    mindset: "Mindset",
  };

  const LANGUAGES = { en: "English", hinglish: "Hinglish" };

  const LIBRARY = {
    en: {
      growth: [
        "You don't outgrow people because you became better than them. You outgrow them because you stopped pretending to be smaller.",
        "The version of you that you're scared to become is usually the one your future is waiting for.",
        "Growth feels a lot like losing at first. You lose old habits, old circles, old excuses.\n\nThen one day you realise you lost nothing that was helping you.",
        "Every level of your life will demand a different version of you. Don't get too attached to the one that got you here.",
        "Some of your best growth will happen in months that look boring from the outside.",
        "You are not behind. You are comparing your chapter 3 to someone else's chapter 20.",
        "If you are the smartest person in every room you walk into, you don't need more confidence. You need new rooms.",
        "The goal isn't to feel ready. The goal is to become the kind of person who moves before feeling ready.",
        "Discomfort is not proof you're on the wrong path. Very often it's proof you finally left the old one.",
        "You can't heal in the same environment that keeps opening the wound.",
        "Your 20s are not for having it all figured out. They are for collecting the lessons that make your 30s look easy.",
        "Most people don't need more information. They need to act on the one thing they already know.",
        "A year from now you'll have one of two things: progress or explanations. Choose which one you want to show.",
        "Read the book. Take the call. Book the ticket.\n\nYour life is waiting on a decision you keep postponing.",
        "The people who grow fastest are not the most talented. They are the ones who can hear criticism without taking it personally.",
        "Stop asking for signs. Your frustration with where you are is the sign.",
        "Small upgrades, repeated every day, will quietly make you unrecognisable.",
        "You don't need a new year to start over. You need one honest evening with yourself.",
        "Whatever you keep tolerating slowly becomes your ceiling.",
        "Your comfort zone isn't protecting you. It's charging you rent in potential you'll never use.",
        "Ego says, \"I already know this.\" Growth says, \"Show me again.\"",
        "Change rarely arrives with an announcement. It usually starts on an ordinary Tuesday when you quietly decide you're done.",
      ],
      discipline: [
        "Motivation gets you to start. Discipline is what shows up when motivation stops replying to your texts.",
        "The days you don't feel like doing it are the only days that actually count.",
        "Discipline is just choosing between what you want now and what you want most.",
        "Your habits are voting for your future every single day. Check who's winning the election.",
        "Nobody talks about how boring success looks up close. Same alarm. Same work. Same choices. For years.",
        "If you only work when you feel inspired, you'll build a life that depends on your mood.",
        "Wake up. Do the hard thing first. Everything after that is a bonus.",
        "The first app you open in the morning is deciding your day for you.",
        "Discipline is self-respect in action. It's keeping promises to the one person who always knows when you break them.",
        "You don't need a perfect plan. You need a plan you'll still follow on day 47.",
        "Consistency is not exciting. That's exactly why it works: most people quit the moment it gets boring.",
        "Do it tired. Do it scared. Do it badly. Just don't leave it undone.",
        "Take a break when you need one. Just don't let the break turn into a new personality.",
        "Your future self is watching what you do when no one else is.",
        "Two hours of focused work beats ten hours of looking busy.",
        "The gap between who you are and who you want to be is filled with things you keep postponing.",
        "Skipping once is human. Skipping twice is the start of a new habit.",
        "Stop negotiating with yourself every morning. Decide once, then execute.",
        "Every shortcut you take today is a loan. Life collects the interest later.",
        "People see the results in public. They never see the thousand quiet mornings that paid for them.",
        "You can't scroll your way into the life you want.",
        "Discipline feels like punishment right up until the day it starts to feel like freedom.",
      ],
      relationships: [
        "The right people won't make you guess where you stand with them.",
        "Some relationships don't end with a fight. They end with a hundred small moments where nobody asked, \"Are you okay?\"",
        "Being understood is rarer than being loved. Hold on to the people who do both.",
        "Silence in a relationship is loud. It's just saying things nobody wants to hear.",
        "You can love someone and still realise they're not good for your peace.",
        "Strong couples still fight. They just fight the problem, not each other.",
        "Pay attention to who is genuinely happy for you when you win. That list is shorter than you think.",
        "Effort is the most honest way to say \"I care.\" Everything else is just words.",
        "Friendships don't fade because of distance. They fade because someone stopped trying.",
        "The person who texts first isn't desperate. They just value the connection more than their ego.",
        "If you're always the one adjusting, it's not a relationship. It's a performance.",
        "Choose the person who makes your bad days lighter, not just your good days prettier.",
        "Your parents didn't get a manual either. Some of their mistakes were just love without instructions.",
        "The people who truly care will notice when your \"I'm fine\" doesn't sound fine.",
        "Stop explaining yourself to people who have already decided to misunderstand you.",
        "A real friend is someone you can sit in silence with and it still feels like a conversation.",
        "Every time you accept less than you deserve, you quietly teach someone that it's enough.",
        "Love isn't proven on anniversaries. It's proven on random Wednesdays.",
        "Some people come into your life to stay. Others come to show you exactly what you'll never accept again.",
        "Before you ask for loyalty, check if you've been giving consistency.",
        "The most attractive quality in a person is emotional safety: you can say anything and not be punished for it.",
        "Sometimes the most loving thing you can do is ask one more question instead of giving one more answer.",
      ],
      money: [
        "Money doesn't change people. It just removes the need to pretend.",
        "Your EMIs are proof that you bought the lifestyle before you could afford it.",
        "Nobody gets rich from their salary. They get rich from what they do with the part they don't spend.",
        "Being broke in your 20s is tuition. Just make sure you're actually learning the lesson.",
        "Your salary pays you for your time. Your wealth depends on what you do with your time after work.",
        "Most people don't have an income problem. They have a \"my friend just bought a new car\" problem.",
        "Real financial freedom isn't a supercar. It's being able to say no to things you hate.",
        "Learn how money works before life teaches you the expensive way.",
        "An emergency fund is just peace of mind that you paid for in advance.",
        "The goal isn't to earn more so you can spend more. It's to earn enough that you stop making decisions out of fear.",
        "You don't need to look successful. You need to be debt-free.",
        "Invest in skills first. They're the only asset a market crash can't touch.",
        "The upgrade you think will make you happy will feel normal in three weeks. Then you'll want the next one.",
        "If you can't manage ₹10,000, you won't manage ₹1,00,000 either. The amount changes. The habit doesn't.",
        "Your bank balance is a reflection of your habits, not your luck.",
        "Compounding is boring for ten years and unbelievable after that. Most people quit in year three.",
        "Nobody posts their loan statements. Remember that before comparing your life to someone's feed.",
        "Talk about money with your family. Silence around money has ruined more homes than lack of money.",
        "The most expensive thing you can own is a lifestyle that needs you to hate your job.",
        "Earn in skills. Save in habits. Grow in patience.",
        "Spending to impress people is renting their attention with your future.",
        "Your first big money lesson will be expensive. Make sure it's the only time you pay for it.",
      ],
      career: [
        "Your degree gets you the interview. Your skills get you the job. Your character keeps you there.",
        "Nobody will care about your career more than you do. Not your boss, not your company, not your parents.",
        "Become the person people think of when a problem shows up. That's the whole career strategy.",
        "Don't just chase the job title. Chase the room where you'll learn the fastest.",
        "Every business looks like an overnight success to people who weren't there for the nights.",
        "Start before you're ready. Improve while you're embarrassed. Win after others have quit.",
        "Your network isn't the people you know. It's the people who would pick up your call.",
        "An idea without execution is just an interesting conversation.",
        "If your job is making you a smaller person, no salary is big enough.",
        "The market doesn't pay for effort. It pays for value. Learn the difference early.",
        "Customers don't care about your story until you solve their problem.",
        "Everyone wants to build the next big app. Meanwhile, someone is quietly getting rich selling what people need every week.",
        "Your first job teaches you what you're good at. Your first failure teaches you who you are.",
        "Ask for the raise. Pitch the idea. Send the email.\n\nThe people who get opportunities are usually just the people who asked.",
        "Stop waiting for permission to build something. Nobody hands out permission slips for ambition.",
        "Being busy is not the same as being valuable. One fills your calendar. The other fills your future.",
        "A founder's real job is to keep going when the plan stops making sense.",
        "Quitting a job that drains you isn't failure. Staying five more years because you're scared might be.",
        "Learn to sell. Every career eventually becomes a sales career.",
        "Do the work so well that your work starts making introductions for you.",
        "Your résumé says what you did. Your reputation says how it felt to work with you.",
        "If you want to be irreplaceable, stop doing only what's in your job description.",
      ],
      selfworth: [
        "You don't have to be liked by everyone. You just have to be respected by yourself.",
        "Stop shrinking yourself to fit into places you've already outgrown.",
        "Someone not choosing you is information, not a verdict on your worth.",
        "Be careful how you talk to yourself. You're the one person who hears every word.",
        "Confidence isn't thinking you're better than everyone. It's no longer needing to compare.",
        "Saying no without over-explaining is a skill. Practise it.",
        "Most people aren't judging you. They're too busy worrying about being judged themselves.",
        "The day you stop needing approval is the day you start having real freedom.",
        "You're allowed to change your mind, your plans, and your circle. Growth isn't betrayal.",
        "You've survived every bad day so far. Your track record is better than your anxiety suggests.",
        "Stop apologising for taking up space. You were never meant to be a background character.",
        "Self-respect sometimes looks like leaving the table quietly.",
        "Protect your energy like it's your money. In the long run, it is.",
        "You don't need closure from others. You can write the ending yourself.",
        "Comparison will make you feel behind in a race you never signed up for.",
        "The loudest person in the room is rarely the most confident one.",
        "Speak to yourself the way you'd speak to your younger sibling on their worst day.",
        "Your worth isn't measured in likes, marks, salary, or relationship status. It never was.",
        "Some people will only understand your value once you stop being available all the time.",
        "Choosing yourself only looks selfish to people who benefited from you not doing it.",
        "You can't keep editing yourself for people who were never going to read you properly.",
        "Rest is not something you have to earn. You're a person, not a machine.",
      ],
      lonely: [
        "The lonely phase is not a punishment. It's where you meet the version of you nobody else has met yet.",
        "When you start taking your life seriously, some people will start taking you less seriously. Keep going.",
        "Not everyone will clap for your growth. Some people only liked the version of you that needed them.",
        "The phase where nobody understands your goals is the phase that's building them.",
        "Your circle getting smaller isn't a loss. It's a filter.",
        "Sometimes you have to eat alone, work alone, and dream alone before you win with a crowd.",
        "The price of being different is that you'll often feel alone. The reward is you'll never feel like a copy.",
        "People will call it luck later. They won't know about the Friday nights you spent at your desk.",
        "Being alone for a while teaches you what kind of company you actually deserve.",
        "Winning big often means disappointing people who were comfortable with you staying small.",
        "Loneliness hurts less when you know what you're building with the time.",
        "The day you stop explaining your dreams to everyone, you'll find more energy to work on them.",
        "Quiet seasons are not empty seasons. Roots grow in the dark.",
        "It's okay if they don't get it yet. You're not building it for their approval.",
        "Isolation is the tuition some dreams demand. Pay it, but don't live there forever.",
        "The fewer people you have to impress, the more time you have to improve.",
        "You don't need a crowd to be on the right path. Sometimes the right path is simply empty.",
        "In the beginning, nobody watches. That's the gift. You get to be terrible in private.",
        "Missing a few parties to build your future isn't sad. Living the same year for a decade is.",
        "Some nights you'll be your own coach, your own cheerleader, and your own audience. That's enough.",
        "One day the people who didn't understand your \"weird phase\" will ask you how you did it.",
        "Not everyone is meant to come with you to the next chapter. That's what makes it a new one.",
      ],
      failure: [
        "Failure isn't the opposite of success. Quitting is.",
        "The embarrassment of trying fades in a week. The regret of not trying stays for years.",
        "You didn't fail. You just found out what it costs. Now decide if you're willing to pay.",
        "Every setback asks one question: \"How badly do you want this?\" Answer it with action.",
        "Fall down in public. Get back up in public. That's how people learn to trust you.",
        "The plan failed. You didn't. Make a new plan.",
        "Nobody remembers your first ten failures. They only remember the time it worked.",
        "If nothing you've tried has failed, you haven't tried anything that matters.",
        "Losing teaches you what winning never will: who stays, and who you really are.",
        "A bad month is not a bad life. Zoom out.",
        "Disappointment is proof you cared. Use that same care to try again, smarter.",
        "Your worst failure will one day be the best part of your story. Keep writing.",
        "Don't hide your failures. They're the only receipts that prove you actually tried.",
        "Every expert you admire has a folder of rejections they don't post about.",
        "Fear of failure is usually fear of what people will think, disguised as caution.",
        "Try again. But this time, try differently.",
        "You're allowed to be disappointed. You're just not allowed to live there.",
        "Failure only becomes permanent when you stop learning from it.",
        "The people laughing at your attempt are not attempting anything.",
        "The comeback doesn't need to be loud. It just needs to be consistent.",
        "One bad result doesn't erase years of good work. Don't let a single chapter rewrite your whole book.",
        "Nobody fails on the sofa. That's exactly why nobody succeeds there either.",
      ],
      creator: [
        "Your first 100 posts will be bad. Post them anyway. That's the entry fee.",
        "Stop waiting to be an expert before you share. Document the journey and let people learn with you.",
        "The internet rewards the people who keep showing up long after everyone else got bored.",
        "Your personal brand is built one honest post at a time, not one viral post at a time.",
        "The people judging your content today will be asking for your advice in two years.",
        "Nobody is watching as closely as you think. That's your freedom to experiment.",
        "Posting consistently for a year will teach you more than a hundred courses about posting.",
        "Views are rented. Trust is owned. Create for trust.",
        "Worried about what relatives will say about your videos? They'll say something no matter what. Might as well be building something.",
        "Every creator you admire once had 12 views and a family member who didn't understand what they were doing.",
        "Your story feels ordinary because you lived it. To someone else, it's the exact answer they needed.",
        "Don't make content for everyone. Make it for the one person who needs to hear it today.",
        "Your drafts folder is full of ideas you were too scared to post.",
        "Being cringe on the way to being great is part of the process. Nobody gets to skip it.",
        "The algorithm changes every month. Being genuinely useful never goes out of style.",
        "Consume less. Create more. Your future is in the second one.",
        "One piece of content can change your life. You just don't know which one, so keep making them.",
        "Your audience doesn't need you to be perfect. They need you to be real and to keep showing up.",
        "Five years from now, you'll wish you had started posting today.",
        "Your phone is either a slot machine or a studio. Decide which one it is for you.",
        "Help people for free for long enough and they'll eventually ask to pay you.",
        "Someone with half your talent is building an audience right now, just because they pressed \"post\".",
      ],
      mindset: [
        "Your mind will always find evidence for whatever you believe about yourself. Choose better beliefs.",
        "The problem isn't that life is hard. It's that you expected it to be easy.",
        "Most of your stress comes from trying to control things that were never yours to control.",
        "Overthinking is just fear dressed up as preparation.",
        "You can't make good decisions from a place of panic. Breathe first, then choose.",
        "Stop waiting for life to get easier. Become someone who handles hard things well.",
        "Gratitude doesn't mean you stop wanting more. It means you stop feeling empty while you work for it.",
        "Your thoughts are not facts. Some of them are just tired.",
        "Your past explains you. It doesn't get to define you.",
        "Peace is not the absence of problems. It's knowing you can face them.",
        "Don't believe everything you think at 2 AM.",
        "Be the calmest person in the room. Calm people make the best decisions.",
        "Luck shows up more often for people who are already moving.",
        "Ask \"What is this teaching me?\" instead of \"Why is this happening to me?\"",
        "Some days, winning just means not giving up. Count those days too.",
        "\"I'll start tomorrow\" is the most expensive sentence you'll ever say.",
        "Hope is not a strategy. But without it, you'll never make one.",
        "You can't think your way out of a problem you keep acting your way into.",
        "Protect your mornings. Whoever controls your first hour controls your whole day.",
        "Life gets lighter the day you stop trying to win arguments that don't matter.",
        "There is no perfect time. There's only now, and the excuses you're willing to give up.",
        "Most regrets aren't about what you did. They're about what you were too comfortable to try.",
      ],
    },
    hinglish: {
      growth: [
        "Tum peeche nahi ho. Bas apni race kisi aur ke track pe daud rahe ho.",
        "Har din thoda better. Bas itna hi karna hai. Baaki kaam time kar dega.",
        "Jis din khud se jhooth bolna band karoge, us din se growth shuru hogi.",
        "Aaj ka thoda sa discomfort, kal ka bahut saara comfort hai.",
      ],
      discipline: [
        "Motivation weekend pe aata hai. Discipline Monday subah 6 baje.",
        "Jo kal karna hai woh aaj karo. \"Kal\" ki calendar mein koi date nahi hoti.",
        "Plan sabko batane se pura nahi hota. Roz thoda karne se hota hai.",
        "Mood ka wait karoge toh zindagi bhi mood pe hi chalegi.",
      ],
      relationships: [
        "Jo insaan tumhe sach mein samajhta hai, use kabhi explain nahi karna padta.",
        "Rishtey time se nahi, effort se chalte hain.",
        "Sabko khush karne ke chakkar mein, khud ko khush karna bhool gaye.",
        "Dost kam ho gaye? Koi baat nahi. Jo bache hain, asli hain.",
      ],
      money: [
        "Paise dikhane ke liye kharchoge, toh paise bachaoge kab?",
        "Salary mehnat ka reward hai. Wealth us salary ke saath liye gaye decisions ka.",
        "EMI pe lifestyle aur savings zero. Yeh growth nahi, pressure hai.",
      ],
      career: [
        "Naukri chhodna risky lagta hai. Poori zindagi aise hi nikal dena usse bhi zyada risky hai.",
        "Mummy-papa ko proud karna hai toh excuse nahi, execution chahiye.",
        "Degree se interview milta hai. Skill se job. Aur attitude se growth.",
      ],
      selfworth: [
        "Log kya kahenge? Log kuch bhi kahenge. Tum apna kaam karo.",
        "Apne aap se baat karte waqt thoda pyaar se bolo. Tum sab sun rahe ho.",
        "Har kisi ko explain karna zaroori nahi. Kuch log sirf galat samajhne ke liye hi sunte hain.",
      ],
      lonely: [
        "Akele chalna padega kuch time. Bheed wahan aati hai jahan raasta ban chuka ho.",
        "Jab log tumhe samajhna band kar dein, samajh jaana tum kuch naya kar rahe ho.",
        "Jo log aaj hans rahe hain, wahi kal poochhenge, \"Bhai, kaise kiya?\"",
      ],
      failure: [
        "Fail hona sharam ki baat nahi. Try hi na karna, woh hai.",
        "Plan fail hua hai, tum nahi. Naya plan banao.",
        "Tumhari 20s ka struggle tumhari 30s ki story banega. Likhte raho.",
      ],
      creator: [
        "Reels dekh ke zindagi nahi badalti. Reels bana ke shayad badal jaaye.",
        "Pehla video cringe hoga. Sauvaan video career banega.",
        "Rishtedaar toh kuch na kuch bolenge hi. Tum post karte raho.",
      ],
      mindset: [
        "Overthinking se problem solve nahi hoti. Bas neend kharab hoti hai.",
        "Himmat ka matlab darr ka na hona nahi hai. Darr ke saath bhi aage badhna hai.",
        "Kismat bhi unhi ka saath deti hai jo already chal rahe hote hain.",
        "Jo cheez tumhe darati hai, shayad wahi tumhe agle level pe le jaayegi.",
      ],
    },
  };

  const CAPTION_HOOKS = [
    "Read that again.",
    "Save this for the day you need it.",
    "Send this to someone who needs to hear it today.",
    "Agree or disagree? Tell me in the comments.",
    "Tag someone who gets it.",
    "Which line hit you the hardest?",
    "Screenshot this. Read it next Monday.",
    "If this is you right now, drop a 🙌",
  ];

  const HASHTAGS = {
    common: ["#quotes", "#relatable", "#dailyquotes", "#mindset"],
    growth: ["#personalgrowth", "#selfimprovement", "#growthmindset"],
    discipline: ["#discipline", "#consistency", "#habits"],
    relationships: ["#relationships", "#friendship", "#love"],
    money: ["#money", "#personalfinance", "#wealth"],
    career: ["#career", "#business", "#entrepreneur"],
    selfworth: ["#selfworth", "#selflove", "#confidence"],
    lonely: ["#lonelyphase", "#hustle", "#focus"],
    failure: ["#failure", "#comeback", "#resilience"],
    creator: ["#contentcreator", "#personalbrand", "#creators"],
    mindset: ["#motivation", "#mentalhealth", "#positivity"],
  };

  /** Flatten the library into [{ id, text, category, lang }]. */
  function allQuotes() {
    const out = [];
    for (const lang of Object.keys(LIBRARY)) {
      for (const category of Object.keys(LIBRARY[lang])) {
        LIBRARY[lang][category].forEach((text, i) => {
          out.push({ id: `${lang}:${category}:${i}`, text, category, lang });
        });
      }
    }
    return out;
  }

  /**
   * Filter the library. `categories` and `langs` are arrays; empty/missing = all.
   */
  function filterQuotes({ categories, langs } = {}) {
    return allQuotes().filter(
      (q) =>
        (!categories || categories.length === 0 || categories.includes(q.category)) &&
        (!langs || langs.length === 0 || langs.includes(q.lang))
    );
  }

  /**
   * Pick `count` quotes the user hasn't seen yet.
   * `used` is a Set of quote ids already shown; when every matching quote has
   * been used, the cycle restarts (and `resetCycle` is reported so the UI can say so).
   * `random` is injectable for tests.
   */
  function pickQuotes({ count = 1, categories, langs, used = new Set(), random = Math.random } = {}) {
    const pool = filterQuotes({ categories, langs });
    if (pool.length === 0) return { quotes: [], resetCycle: false };

    let fresh = pool.filter((q) => !used.has(q.id));
    let resetCycle = false;
    const picked = [];

    while (picked.length < Math.min(count, pool.length)) {
      if (fresh.length === 0) {
        resetCycle = true;
        for (const q of pool) used.delete(q.id);
        for (const q of picked) used.add(q.id);
        const pickedIds = new Set(picked.map((q) => q.id));
        fresh = pool.filter((q) => !pickedIds.has(q.id));
      }
      const i = Math.floor(random() * fresh.length);
      const [q] = fresh.splice(i, 1);
      used.add(q.id);
      picked.push(q);
    }
    return { quotes: picked, resetCycle };
  }

  /** Build an Instagram/LinkedIn caption with a hook and hashtags. */
  function makeCaption(quote, random = Math.random) {
    const hook = CAPTION_HOOKS[Math.floor(random() * CAPTION_HOOKS.length)];
    const tags = [...(HASHTAGS[quote.category] || []), ...HASHTAGS.common];
    return `${hook}\n\n${tags.join(" ")}`;
  }

  return { CATEGORIES, LANGUAGES, LIBRARY, allQuotes, filterQuotes, pickQuotes, makeCaption };
});
