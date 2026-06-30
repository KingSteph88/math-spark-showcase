export const semester1 = {
  label: "Semester 1",
  subjects: [
    {
      slug: "algebre-1",
      name: "Algèbre 1",
      hue: "from-orange-300/60 to-pink-300/60",
      chapters: [
        { id: "alg1-c1", n: 1, title: "Fractions & Polynômes", desc: "Manipulation de fractions rationnelles et factorisation." },
        { id: "alg1-c2", n: 2, title: "Espaces Vectoriels", desc: "Structures, bases et dimensions des espaces vectoriels." },
        { id: "alg1-c3", n: 3, title: "Applications Linéaires", desc: "Noyau, image et représentation matricielle." },
      ],
    },
    {
      slug: "analyse-1",
      name: "Analyse 1",
      hue: "from-rose-300/60 to-purple-300/60",
      chapters: [
        { id: "ana1-c1", n: 1, title: "Limites et Continuité", desc: "Études de limites, théorèmes fondamentaux." },
        { id: "ana1-c2", n: 2, title: "Fonctions Réciproques et Hyperboliques", desc: "Inverse, arcsin, arctan, ch, sh, th." },
        { id: "ana1-c3", n: 3, title: "Intégrales et Changement de Variables", desc: "Techniques d'intégration essentielles." },
        { id: "ana1-c4", n: 4, title: "Développements Limités", desc: "Formules de Taylor, applications." },
      ],
    },
  ],
};

export const semester2 = {
  label: "Semester 2",
  subjects: [
    {
      slug: "algebre-2",
      name: "Algèbre 2",
      hue: "from-amber-300/60 to-rose-300/60",
      chapters: [
        { id: "alg2-c1", n: 1, title: "Calcul Matriciel", desc: "Opérations, inverses et systèmes linéaires." },
        { id: "alg2-c2", n: 2, title: "Déterminants dans les Matrices", desc: "Calcul, propriétés et applications." },
        { id: "alg2-c3", n: 3, title: "Applications Linéaires dans les Matrices", desc: "Diagonalisation et changement de base." },
      ],
    },
    {
      slug: "analyse-2",
      name: "Analyse 2",
      hue: "from-fuchsia-300/60 to-orange-300/60",
      chapters: [
        { id: "ana2-c1", n: 1, title: "Suites Réelles", desc: "Convergence, sous-suites, critères." },
        { id: "ana2-c2", n: 2, title: "Séries Numériques", desc: "Critères de convergence et sommation." },
        { id: "ana2-c3", n: 3, title: "Intégrales Généralisées", desc: "Convergence et techniques avancées." },
        { id: "ana2-c4", n: 4, title: "Équations Différentielles", desc: "EDO du premier et second ordre." },
      ],
    },
  ],
};

export const allSemesters = [semester1, semester2];

export function findChapter(id: string) {
  for (const s of allSemesters) {
    for (const sub of s.subjects) {
      const c = sub.chapters.find((c) => c.id === id);
      if (c) return { chapter: c, subject: sub, semester: s };
    }
  }
  return null;
}
