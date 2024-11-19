import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { SortBy, type User } from './types.d'
import { UsersList } from './components/UsersList'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [showColors, setShowColors] = useState(false);
  const [sorting, setSorting] = useState<SortBy>(SortBy.NONE);
  const [filterCountry, setFilterCountry] = useState<string | null>(null)

  const originalUsers = useRef<User[]>([])

  const toggleColors = () => {
    setShowColors(!showColors)
  }

  const toggleSortByCountry = () => {
    const newSortingValue = sorting == SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE
    setSorting(newSortingValue)
  }

  useEffect(() => {
    fetch('https://randomuser.me/api?results=100')
      .then(res => res.json())
      .then(data => {
        setUsers(data.results)
        originalUsers.current = data.results
      })
      .catch(error => console.error(error))
  }, [])

  const handleDelete = (email: string) => {
    const filteredUsers = users.filter((user) => {
      return user.email !== email;
    })

    setUsers(filteredUsers)
  }

  const handleReset = () => {
    setUsers(originalUsers.current);
  }

  const handleChangeFilterCountry = (event:ChangeEvent<HTMLInputElement>) => {
    setFilterCountry(event.target.value)
  }

  const handleChangeSort = (sort : SortBy) => {
    setSorting(sort)
  }

  const filteredUser = useMemo(() => {
    return filterCountry != null && filterCountry.length > 0
      ? users.filter((user => {
        return user.location.country.toLocaleLowerCase()
          .includes(filterCountry.toLocaleLowerCase());
  })) : users},[users, filterCountry])

  const sortedUsers = useMemo(() => {
    
    if(sorting == SortBy.NONE) return filteredUser;

    const compareProperties: Record<string, (user: User) => any> = {
      [SortBy.COUNTRY] : user => user.location.country,
      [SortBy.NAME] : user => user.name.first,
      [SortBy.LAST] : user => user.name.last,
    }

    return [... filteredUser].sort((a,b) => {
      const extractProperty = compareProperties[sorting]
      return extractProperty(a).localeCompare(extractProperty(b));
    })

  },[filteredUser, sorting])

  return (
    <div className='App'>
      <h1>Prueba técnica</h1>
      <header>
        <button onClick={toggleColors}>Colorear filas</button>
        <button onClick={toggleSortByCountry}>
          {sorting == SortBy.COUNTRY ? 'No ordenar por país' : 'Ordenar por país'}
        </button>
        <button onClick={handleReset}>Resetear usuarios</button>
        <input type="text" placeholder='Filtra por país' onChange={handleChangeFilterCountry}/>
      </header>
      <main>
        <UsersList changeSorting={handleChangeSort} deleteUser={handleDelete} users={sortedUsers} showColors={showColors} />
      </main>
    </div>
  )
}

export default App
