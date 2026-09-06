import { formatSemester } from "@/lib/semester";
import { getGroupColor } from "@/lib/utils";
import type { Course, Semester } from "@/types/courses";

const IMAGE_WIDTH = 2200;
const COLUMN_COUNT = 4;
const OUTER_PADDING = 70;
const COLUMN_GAP = 28;
const SECTION_GAP = 28;
const COURSE_HEIGHT = 54;
const SECTION_HEADER_HEIGHT = 72;

type PlannedCourse = Course & { plannedSemester: number | "accredited" };
type PlanSection = { key: string; title: string; courses: PlannedCourse[] };

const roundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
};

const fitText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (context.measureText(text).width <= maxWidth) return text;
  let shortened = text;
  while (shortened.length > 1 && context.measureText(`${shortened}…`).width > maxWidth) shortened = shortened.slice(0, -1);
  return `${shortened}…`;
};

const getSections = (courses: Course[], startingSemester: Semester): PlanSection[] => {
  const plannedCourses = courses.filter((course): course is PlannedCourse => course.plannedSemester !== undefined);
  const semesterNumbers = Array.from(
    new Set(plannedCourses.flatMap((course) => (typeof course.plannedSemester === "number" ? [course.plannedSemester] : []))),
  ).sort((a, b) => a - b);
  const sections = semesterNumbers.map((semester) => ({
    key: `semester-${semester}`,
    title: `Semester ${formatSemester(semester, startingSemester)}`,
    courses: plannedCourses.filter((course) => course.plannedSemester === semester),
  }));
  const accredited = plannedCourses.filter((course) => course.plannedSemester === "accredited");
  if (accredited.length > 0) sections.push({ key: "accredited", title: "Accredited courses", courses: accredited });
  return sections;
};

const sectionHeight = (section: PlanSection) => SECTION_HEADER_HEIGHT + Math.max(section.courses.length, 1) * COURSE_HEIGHT + 20;

export async function createPlanImage({
  courses,
  hideGrades,
  startingSemester,
}: {
  courses: Course[];
  hideGrades: boolean;
  startingSemester: Semester;
}): Promise<Blob> {
  await document.fonts?.ready;
  const sections = getSections(courses, startingSemester);
  const rows: PlanSection[][] = [];
  for (let index = 0; index < sections.length; index += COLUMN_COUNT) rows.push(sections.slice(index, index + COLUMN_COUNT));
  const contentTop = OUTER_PADDING;
  const footerHeight = 80;
  const contentHeight = sections.length ? rows.reduce((total, row) => total + Math.max(...row.map(sectionHeight)) + SECTION_GAP, 0) : 230;
  const imageHeight = contentTop + contentHeight + footerHeight;
  const appUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_WIDTH;
  canvas.height = imageHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported by this browser.");

  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, IMAGE_WIDTH, imageHeight);
  if (sections.length === 0) {
    context.fillStyle = "#ffffff";
    roundedRect(context, OUTER_PADDING, contentTop, IMAGE_WIDTH - OUTER_PADDING * 2, 150, 18);
    context.fill();
    context.strokeStyle = "#e2e8f0";
    context.stroke();
    context.fillStyle = "#64748b";
    context.font = "26px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText("No courses have been planned yet.", IMAGE_WIDTH / 2, contentTop + 86);
    context.textAlign = "left";
  } else {
    const columnWidth = (IMAGE_WIDTH - OUTER_PADDING * 2 - COLUMN_GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT;
    let y = contentTop;
    for (const row of rows) {
      const rowHeight = Math.max(...row.map(sectionHeight));
      row.forEach((section, column) => {
        const x = OUTER_PADDING + column * (columnWidth + COLUMN_GAP);
        context.fillStyle = "#ffffff";
        roundedRect(context, x, y, columnWidth, rowHeight, 18);
        context.fill();
        context.strokeStyle = "#dbe3ee";
        context.lineWidth = 2;
        context.stroke();
        context.fillStyle = "#0f172a";
        context.font = "700 24px system-ui, sans-serif";
        context.fillText(section.title, x + 24, y + 42);
        const totalECTS = section.courses.reduce((total, course) => total + course.ects, 0);
        context.fillStyle = "#64748b";
        context.font = "18px system-ui, sans-serif";
        context.textAlign = "right";
        context.fillText(`${totalECTS} ECTS`, x + columnWidth - 24, y + 41);
        context.textAlign = "left";

        section.courses.forEach((course, courseIndex) => {
          const courseY = y + SECTION_HEADER_HEIGHT + courseIndex * COURSE_HEIGHT;
          context.fillStyle = getGroupColor(course.group) ?? "#e2e8f0";
          roundedRect(context, x + 20, courseY, columnWidth - 40, COURSE_HEIGHT - 8, 10);
          context.fill();
          context.fillStyle = "#0f172a";
          context.font = "600 18px system-ui, sans-serif";
          context.fillText(fitText(context, course.name, columnWidth - 175), x + 34, courseY + 29);
          context.fillStyle = "#334155";
          context.font = "16px system-ui, sans-serif";
          context.textAlign = "right";
          const grade = !hideGrades && course.grade !== undefined ? ` · Grade ${course.grade}` : "";
          context.fillText(`${course.ects} ECTS${grade}`, x + columnWidth - 34, courseY + 29);
          context.textAlign = "left";
        });
      });
      y += rowHeight + SECTION_GAP;
    }
  }

  context.fillStyle = "#2563eb";
  context.font = "20px system-ui, sans-serif";
  context.textAlign = "right";
  context.fillText(`Created with ${appUrl}`, IMAGE_WIDTH - OUTER_PADDING, imageHeight - 34);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the plan image."))), "image/png");
  });
}
