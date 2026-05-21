export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-dark)] text-white py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Palmery</h3>
          <p className="text-sm text-white/60">
            &copy; 2024 Palmery Plantation Systems. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/60">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          <a href="#" className="hover:text-white transition-colors">Palmery.com</a>
        </div>
      </div>
    </footer>
  );
}
