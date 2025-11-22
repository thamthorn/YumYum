"use client";

interface AnalyticsOverviewProps {
  profileViews: number;
  contactClicks: number;
  rfqSent: number;
  productViews: number;
  periodLabel: string;
}

export function AnalyticsOverview({
  profileViews,
  contactClicks,
  rfqSent,
  productViews,
  periodLabel,
}: AnalyticsOverviewProps) {
  const conversionRate = profileViews > 0 ? (rfqSent / profileViews) * 100 : 0;
  const contactRate =
    profileViews > 0 ? (contactClicks / profileViews) * 100 : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Profile Views */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Profile Views</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {profileViews.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-500">{periodLabel}</p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Contact Clicks */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Contact Clicks</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {contactClicks.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-green-600">
              {contactRate.toFixed(1)}% of views
            </p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* RFQs Received */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">RFQs Received</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {rfqSent.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-green-600">
              {conversionRate.toFixed(1)}% conversion
            </p>
          </div>
          <div className="rounded-full bg-purple-100 p-3">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Product Views */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Product Views</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {productViews.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-500">{periodLabel}</p>
          </div>
          <div className="rounded-full bg-orange-100 p-3">
            <svg
              className="h-6 w-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TopKeyword {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface KeywordTableProps {
  keywords: TopKeyword[];
}

export function KeywordTable({ keywords }: KeywordTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Top Search Keywords
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Keyword
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Impressions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Clicks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                CTR
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {keywords.map((keyword, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {keyword.keyword}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {keyword.impressions.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {keyword.clicks.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {keyword.ctr.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {keywords.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No keyword data available yet
        </div>
      )}
    </div>
  );
}
