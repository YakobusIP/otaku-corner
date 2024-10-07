export default function GeneralFooter() {
  return (
    <footer className="bg-muted py-6 text-muted-foreground">
      <div className="container flex items-center justify-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} bearking58 Otaku Corner
        </p>
      </div>
    </footer>
  );
}
