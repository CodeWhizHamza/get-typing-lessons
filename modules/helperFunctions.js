export function generateLessonFileNameFromLink(link) {
  return 'lesson-' + link.split('/').slice(-1)[0].slice(0, -5) + '.txt'
}
