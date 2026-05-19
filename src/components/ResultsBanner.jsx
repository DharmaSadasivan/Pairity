export default function ResultsBanner({ changeCount }) {
  const pass = changeCount === 0

  return (
    <div className={`
      rounded-xl px-6 py-5 flex items-center gap-4
      ${pass ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
    `}>
      <span className="text-3xl">{pass ? '✅' : '⚠️'}</span>
      <div>
        <div className={`font-semibold text-lg ${pass ? 'text-green-800' : 'text-red-800'}`}>
          {pass ? 'No differences detected' : `${changeCount} difference${changeCount === 1 ? '' : 's'} detected`}
        </div>
        <div className={`text-sm mt-0.5 ${pass ? 'text-green-700' : 'text-red-700'}`}>
          {pass
            ? 'The PDF is consistent with the Word document.'
            : 'The PDF differs from the Word document in the locations highlighted below.'}
        </div>
      </div>
    </div>
  )
}
