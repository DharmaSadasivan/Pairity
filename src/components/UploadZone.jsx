import { useRef, useState } from 'react'

export default function UploadZone({ label, accept, file, onFile, icon }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFile(dropped)
  }

  function handleChange(e) {
    const selected = e.target.files[0]
    if (selected) onFile(selected)
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center gap-3
        rounded-xl border-2 border-dashed p-8 cursor-pointer
        transition-colors duration-150 min-h-48 text-center
        ${dragging
          ? 'border-blue-500 bg-blue-50'
          : file
            ? 'border-green-400 bg-green-50'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      <div className="text-3xl">{icon}</div>

      {file ? (
        <>
          <div className="text-green-700 font-medium text-sm break-all px-2">
            {file.name}
          </div>
          <div className="text-green-600 text-xs">
            {(file.size / 1024).toFixed(1)} KB — click to replace
          </div>
        </>
      ) : (
        <>
          <div className="font-medium text-slate-700 text-sm">{label}</div>
          <div className="text-slate-400 text-xs">
            Drag &amp; drop or click to browse
          </div>
        </>
      )}
    </div>
  )
}
