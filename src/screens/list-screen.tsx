import CourseTable from "@/components/table/course-table";

export default function ListScreen() {
  return (
    <section className="m-2 flex h-full flex-col py-2 sm:m-4">
      <header className="px-2 pt-1 sm:px-4">
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, filter, schedule, and grade every course from one place.
        </p>
      </header>
      <CourseTable />
    </section>
  );
}
