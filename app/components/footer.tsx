export default function Footer() {
  return (
    <footer className="flex grow items-end">
      <div className="flex w-full items-center justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Tirunelveli Economic Chamber
        </p>
        <img src="/tec.png" alt="TEC Logo" className="my-3 w-32" />
      </div>
    </footer>
  );
}
