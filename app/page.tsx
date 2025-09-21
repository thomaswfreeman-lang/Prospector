export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prospector</h1>
      <p className="mb-4">Fire safety testing prospect finder</p>
      <a 
        href="/template-search" 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Go to Template Search
      </a>
    </div>
  )
}