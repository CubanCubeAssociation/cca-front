import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ url }) => {
  const { pathname } = url;

  const routes = [
    ["/contests", "Competencias", "Listado de todas las competencias de la CCA"],
    ["/results", "Resultados", "Mejores marcas de tiempo y promedio de la CCA"],
    ["/ranking", "Ranking", "Ranking de single y media por categorías"],
    ["/rules", "Reglamento", "Reglamento de la CCA"],
    ["/cca", "CCA", "Acerca de la CCA"],
    ["/login", "Entrar", "Entrar al sistema"],
    ["/admin/user", "Administrar usuarios", "Administración de usuarios"],
    ["/admin/contest", "Administrar competencias", "Administración de competencias"],
    ["/admin/category", "Administrar categorías", "Administración de categorías"],
  ];

  for (let i = 0, maxi = routes.length; i < maxi; i += 1) {
    if (pathname.startsWith(routes[i][0])) {
      return {
        title: routes[i][1],
        description: routes[i][2],
      };
    }
  }

  return {
    title: "Cuban Cube Association - CCA",
    description:
      "La Asociación Cubana del Cubo se encarga de registrar todos los datos de las competencias de speedcubing en Cuba",
  };
};

export const ssr = false;
