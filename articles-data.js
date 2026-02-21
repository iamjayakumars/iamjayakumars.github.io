/* ============================================================
   ARTICLES REGISTRY — Homepage listing
   ============================================================

   HOW TO ADD A NEW ARTICLE (2 simple steps):

   STEP 1 → Create the article HTML file
     - Copy  articles/_TEMPLATE.html
     - Rename it (e.g.  articles/my-new-article.html)
     - Edit the title, date, tags inside the file
     - Write your article content in regular HTML
     - Save

   STEP 2 → Register it here (so it shows on the homepage)
     - Add ONE line below, inside the articles array:

       { file: "my-new-article.html", title: "My Title", excerpt: "Short summary...", date: "2026-03-15", tags: ["Tag1","Tag2"] },

     - Save. Done!

   ============================================================ */

window.ARTICLES_DATA = {
  linkedin_profile: "https://www.linkedin.com/in/iamjayakumars/",

  articles: [
    /* ↓ Newest first ↓ */
    {
      file: "stop-solving-500-leetcode-problems-heres-why.html",
      title: "Stop solving 500 LeetCode problems. Here\u2019s why",
      excerpt: "We\u2019ve stopped looking for people who can write code. We need people who can read code, analyze it, and come up with creative ideas on AI platforms.",
      date: "2026-02-21",
      tags: ["Career", "Student", "LeetCode", "Problem Solving"]
    },
    {
      file: "recruiters-see-one-gap-students-dont.html",
      title: "Recruiters See One Gap Students Don\u2019t. It\u2019s Not Skills.",
      excerpt: "Campus placements in 2025 are brutal. But the gap between placed and unplaced students isn\u2019t talent or college brand. It\u2019s application depth.",
      date: "2026-02-20",
      tags: ["Campus Placements", "Career Guidance", "Student Career"]
    }
    /* ↑ Add new articles above this line ↑ */
  ]
};
