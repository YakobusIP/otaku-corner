export default function GeneralFooter() {
  return (
    <footer className="bg-muted py-6 text-muted-foreground">
      <div className="container flex items-center justify-between">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Otaku Corner
        </p>
      </div>
    </footer>
  );
}
