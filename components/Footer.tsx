export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="space-y-4">
          <div className="text-gray-700 dark:text-gray-300">
            <h3 className="font-semibold mb-2">Privacy & Freedom</h3>
            <p className="text-sm">
              This website collects <strong>zero data</strong>. No analytics, no tracking, no cookies.
            </p>
            <p className="text-sm">
              Completely free to use. No ads, no subscriptions, no hidden costs.
            </p>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Word of the Day &copy; {new Date().getFullYear()}</p>
            <p className="mt-1">
              Built with care for vocabulary enthusiasts everywhere.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
