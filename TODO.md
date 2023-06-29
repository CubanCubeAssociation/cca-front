# TODO

## Home

## Información

## Competencias

## Resultados

## Reglamento

## CCA
  * Blog
  * Insignias
  * Competidores
  * Directiva

## Entrar / Registrarse

## Datos en general
### Usuario
  * Nombre completo
  * Email
  * Contraseña
  * CI
  * Sexo
  * Nombre de usuario (reservado por la CCA)
  * Provincia
  * Municipio
  * Credito (reservado por la CCA)
  * Avatar
  * rol
  * edad (no editable)
  * competencias
  * records personales

### Competencia
  * Nombre
  * Lugar
  * Fecha
  * Hora
  * Inicio de inscripción
  * Fin de inscripción
  * Categorías
  * Competidores
  * Costo de inscripción
  * Visible
  * Estado (pendiente, inscripción, en curso, resultados, terminado)
  * Usuarios inscritos
  * Usuarios con inscripcion paga
  * Resoluciones

### Categoría
  * Nombre
  * Icono
  * Scrambler

### Resolución
  * Competencia
  * Categoria
  * Ronda
  * Usuario
  * Mezclador
  * Juez
  * Reconstrucción
  * Tiempo (en formato corrido, ej 1243 => 12.43s)

### Permisos
  - user:getOwn (nombre, ci, password, email, municipio, provincia)
  - user:editOwn (nombre, ci, password, email, municipio, provincia)
  - user:editUser (all)
  - user:editName
  - user:editCI
  - user:editProvince
  - user:editMunicipality
  - user:editCredit
  - user:createUser
  - user:deleteUser
  - 
  - contest:getContests
  - contest:createContest
  - contest:editContest
  - contest:editUsers
  - contest:editPaidUsers
  - contest:changeVisibility
  - contest:deleteContest
  - contest:changeState
  - contest:approveResults
  - 
  - category:createCategory
  - category:editCategory
  - category:getCategories
  - category:deleteCategory
  - 
  - solve:createSolve
  - solve:editSolve
  - solve:getSolves
  - solve:deleteSolve
  - solve:editSolveTime

### Roles
  * unauthenticated
    - user:getUsers
    - contest:getContests
  * user
    - user:getUsers
    - user:getOwn (nombre, ci, password, email, municipio, provincia)
    - user:editOwn (nombre, ci, password, email, municipio, provincia)
  * delegate
    - user:getUsers
    - user:getOwn (nombre, ci, password, email, municipio, provincia)
    - user:editOwn (nombre, ci, password, email, municipio, provincia)
    - user:editName
    - user:editCI
    - user:editProvince
    - user:editMunicipality
    - 
    - contest:editUsers
    - contest:editPaidUsers
    - contest:changeState
    - 
    - solve:createSolve
    - solve:getSolves
    - solve:editSolveTime
  * admin
    - user:getUsers
    - user:getOwn (nombre, ci, password, email, municipio, provincia)
    - user:editOwn (nombre, ci, password, email, municipio, provincia)
    - user:editUser (all)
    - user:editName
    - user:editCI
    - user:editProvince
    - user:editMunicipality
    - user:editCredit
    - user:createUser
    - user:removeUsers
    - 
    - contest:createContest
    - contest:editContest
    - contest:editUsers
    - contest:editPaidUsers
    - contest:changeVisibility
    - contest:removeContests
    - contest:changeState
    - contest:approveResults
    - 
    - category:createCategory
    - category:editCategory
    - category:getCategories
    - category:removeCategories
    - 
    - solve:createSolve
    - solve:editSolve
    - solve:getSolves
    - solve:removeSolves
    - solve:editSolveTime

### DATA
```javascript
  [
    {
      "name": "3x3x3",
      "icon": "/public/WCA/333.svg",
      "scrambler": "333",
      "id": "643b483c6d826f1480128d79"
    },
    {
      "name": "2x2x2",
      "icon": "/public/WCA/222so.svg",
      "scrambler": "222",
      "id": "643b48576d826f1480128d7c"
    },
    {
      "name": "4x4x4",
      "icon": "/public/WCA/444wca.svg",
      "scrambler": "444wca",
      "id": "643b486a6d826f1480128d7f"
    },
    {
      "name": "5x5x5",
      "icon": "/public/WCA/555wca.svg",
      "scrambler": "555wca",
      "id": "643b48786d826f1480128d82"
    },
    {
      "name": "6x6x6",
      "icon": "/public/WCA/666wca.svg",
      "scrambler": "666wca",
      "id": "643b48856d826f1480128d85"
    },
    {
      "name": "7x7x7",
      "icon": "/public/WCA/777wca.svg",
      "scrambler": "777wca",
      "id": "643b48936d826f1480128d88"
    },
    {
      "name": "3x3x3 BLD",
      "icon": "/public/WCA/333ni.svg",
      "scrambler": "333ni",
      "id": "643b4ba06d826f1480128db5"
    },
    {
      "name": "3x3x3 FM",
      "icon": "/public/WCA/333fm.svg",
      "scrambler": "333fm",
      "id": "643b4bab6d826f1480128db8"
    },
    {
      "name": "3x3x3 OH",
      "icon": "/public/WCA/333oh.svg",
      "scrambler": "333oh",
      "id": "643b4bbc6d826f1480128dbb"
    },
    {
      "name": "Clock",
      "icon": "/public/WCA/clkwca.svg",
      "scrambler": "clkwca",
      "id": "643b4bcf6d826f1480128dbe"
    },
    {
      "name": "Megaminx",
      "icon": "/public/WCA/mgmp.svg",
      "scrambler": "mgmp",
      "id": "643b4be06d826f1480128dc1"
    },
    {
      "name": "Pyraminx",
      "icon": "/public/WCA/pyrso.svg",
      "scrambler": "pyrso",
      "id": "643b4bf36d826f1480128dc4"
    },
    {
      "name": "Skewb",
      "icon": "/public/WCA/skbso.svg",
      "scrambler": "skbso",
      "id": "643b4c046d826f1480128dc7"
    },
    {
      "name": "Square One",
      "icon": "/public/WCA/sqrs.svg",
      "scrambler": "sqrs",
      "id": "643b4c226d826f1480128dca"
    },
    {
      "name": "4x4x4 BLD",
      "icon": "/public/WCA/444bld.svg",
      "scrambler": "444bld",
      "id": "643b4c3f6d826f1480128dcd"
    },
    {
      "name": "5x5x5 BLD",
      "icon": "/public/WCA/555bld.svg",
      "scrambler": "555bld",
      "id": "643b4c4d6d826f1480128dd0"
    },
    {
      "name": "3x3x3 Multi BLD",
      "icon": "/public/WCA/333mbf.svg",
      "scrambler": "333mbf",
      "id": "643b4c6a6d826f1480128dd3"
    }
  ]
```