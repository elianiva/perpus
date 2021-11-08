// this file uses Deno
const titles = [
  "Life-span human development",
  "Contemporary abstract algebra",
  "Criminology",
  "The logic of American politics",
  "College physics",
  "The music kit",
  "Active physics",
  "Physical chemistry",
  "Essentials of statistics for scientists and technologists",
  "Mathematical statistics",
  "Keeping the republic",
  "Organic and biological chemistry",
  "Physics for poets",
  "Basic technical mathematics with calculus",
  "About teaching mathematics",
  "Applied psychology in personnel management",
  "Applied statistics and probability for engineers",
  "Applied statistical decision theory",
  "Calculus and analytic geometry",
  "Calculus and its applications",
  "Calculus with analytic geometry",
  "Biology made simple",
  "Beginning algebra",
  "Calculus",
  "Research methods in psychology",
  "Statistics",
  "Psychological statistics",
  "Chemistry",
  "Mathematics and plausible reasoning",
  "Abnormal psychology",
  "Chemistry",
  "Abnormal psychology",
  "Adolescence",
  "Introduction to psychology",
  "The mathematical experience",
  "Elementary statistics",
  "General chemistry",
  "Environmental science",
  "Cognition",
  "Fundamentals of analytical chemistry",
  "Fundamentals of algebra and trigonometry",
  "Fundamentals of chemistry",
  "Fundamentals of philosophy",
  "College algebra with trigonometry",
  "Business statistics : contemporary decision making",
  "Chemistry for changing times",
  "Economics",
  "Educational psychology",
  "Explorations : an introduction to astronomy",
  "Elementary algebra for college students",
  "Psychology and life; a study of the thinking, feel… including a section on physiological backgrounds",
  "Operational organic chemistry : a laboratory course",
  "Organizational psychology; a book of readings",
  "Origins : Canadian history to Confederation",
  "Physical anthropology and archeology",
  "No exit (Huis clos) a play in one act, & The flies (Les mouches) a play in three acts",
  "Probability and statistics for modern engineering",
  "Power & choice",
  "Physics : a world view",
  "Social psychology",
  "Basic statistics: a primer for the biomedical sciences",
  "Advanced organic chemistry",
  "Abnormal psychology and modern life",
  "Physical chemistry",
  "The American democracy",
  "Social psychology",
  "Psychology",
  "Understanding movies",
  "Algebra and trigonometry with analytic geometry",
  "Mathematical discovery : on understanding, learning, and teaching problem solving",
  "Algebra, the easy way",
  "The atmosphere : an introduction to meteorology",
  "College algebra : a functions approach",
  "Chemistry",
  "College algebra",
  "College algebra",
  "Complete business statistics",
  "Biological science",
  "Beginning logic",
  "Beneath the mask : an introduction to theories of personality",
  "Basic statistical analysis",
  "Dictionary of anthropology",
  "Elementary algebra : concepts and applications",
  "Elementary algebra for college students",
  "Elementary school mathematics : teaching developmentally",
  "Elementary statistics",
  "Encounter with anthropology",
  "The developing child",
  "Development through life : a psychosocial approach",
  "California : the politics of diversity",
  "Calculus",
  "Calculus & its applications",
  "Current perspectives in social psychology; readings with commentary",
  "Cognitive psychology in and out of the laboratory",
  "After the fact : American historians and their methods",
  "A course in mathematical analysis",
  "Contemporary business",
  "Foundations of astronomy",
  "Foundations of college chemistry",
].map((title) => encodeURIComponent(title.replace(/\s/g, "+").toLowerCase()));

let r = [];

for (let i = 0, len = titles.length; i < len; i++) {
  const title = titles[i];

  const result = await fetch(`http://openlibrary.org/search.json?q=${title}&jscmd=data`).then(
    (res) => res.json()
  );

  const item = result.docs.filter((r) => r.publisher?.length > 0)[0];

  const detail = await fetch(`http://openlibrary.org${item.key}.json`).then((res) => res.json());

  const author = detail.authors?.[0]?.author?.key
    ? await fetch(`http://openlibrary.org${detail.authors[0].author.key}.json`).then((res) =>
        res.json()
      )
    : "Unknown";

  r.push({
    judul: detail.title,
    deskripsi: `A book about ${detail.subjects?.[0] ?? "Unknown"}.`,
    pengarang: author.name,
    penerbit: item.publisher?.[0] ?? "Unknown",
    cover_url: `https://covers.openlibrary.org/b/id/${detail.covers?.[0] ?? "394782"}-M.jpg`,
  });
}

await Deno.writeTextFile("./fake.g.json", JSON.stringify({ data: r }, null, 2));
