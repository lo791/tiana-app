"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";

type IngredienteBase = { id: number; nombre: string; precioUnitario: number; unidad: string };
type IngredientePlato = { ingredienteId: number; cantidad: number };
type Plato = { id: number; nombre: string; foto: string; ganancia: number; ingredientes: IngredientePlato[]; porciones?: number };
type ItemPedidoForm = { platoId: number; cantidad: number };
type ItemPedidoSnapshot = {
  platoId: number;
  nombrePlato: string;
  cantidad: number;
  costoUnitario: number;
  precioVentaUnitario: number;
  ganancia: number;
  ingredientes: { nombre: string; cantidad: number; unidad: string; precioUnitario: number }[];
};
type Pedido = {
  id: number;
  fecha: string;
  cliente: string;
  direccion: string;
  telefono: string;
  items: ItemPedidoSnapshot[];
  total: number;
  costoTotal: number;
};

export default function Home() {
  const [tab, setTab] = useState<'ingredientes' | 'platos' | 'pedidos' | 'estadisticas'>('platos');
  const [subTabPlatos, setSubTabPlatos] = useState<'salados' | 'dulces'>('salados');

  const [ingredientesBase, setIngredientesBase] = useState<IngredienteBase[]>(() => {
    if (typeof window === 'undefined') return [];
    const guardado = localStorage.getItem('ingredientes');
    return guardado? JSON.parse(guardado) : [];
  });

  const [platos, setPlatos] = useState<Plato[]>(() => {
    if (typeof window === 'undefined') return [];
    const guardado = localStorage.getItem('platos');
    return guardado? JSON.parse(guardado) : [];
  });

  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    if (typeof window === 'undefined') return [];
    const guardado = localStorage.getItem('pedidos');
    return guardado? JSON.parse(guardado) : [];
  });

  const [nombreIng, setNombreIng] = useState("");
  const [precioIng, setPrecioIng] = useState(0);
  const [unidadIng, setUnidadIng] = useState("kg");
  const [editandoPrecioId, setEditandoPrecioId] = useState<number | null>(null);
  const [precioEditTemp, setPrecioEditTemp] = useState(0);
  const [busquedaIng, setBusquedaIng] = useState("");

  const [nombrePlato, setNombrePlato] = useState("");
  const [fotoPlato, setFotoPlato] = useState("");
  const [ganancia, setGanancia] = useState(50);
  const [ingredientesPlato, setIngredientesPlato] = useState<IngredientePlato[]>([]);
  const [busquedasPorFila, setBusquedasPorFila] = useState<{[key: number]: string}>({});
  const [porciones, setPorciones] = useState(1);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cliente, setCliente] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [itemsPedido, setItemsPedido] = useState<ItemPedidoForm[]>([]);

  const [platoAbierto, setPlatoAbierto] = useState<number | null>(null);
  const [pedidoAbierto, setPedidoAbierto] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('ingredientes', JSON.stringify(ingredientesBase));
  }, [ingredientesBase]);

  useEffect(() => {
    localStorage.setItem('platos', JSON.stringify(platos));
  }, [platos]);

  useEffect(() => {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  const manejarSubidaImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFotoPlato(event.target?.result as string);
    };
    reader.readAsDataURL(archivo);
  };

  const agregarIngredienteBase = () => {
    if (!nombreIng || precioIng <= 0) return;
    setIngredientesBase([...ingredientesBase, { id: Date.now(), nombre: nombreIng, precioUnitario: precioIng, unidad: unidadIng }]);
    setNombreIng("");
    setPrecioIng(0);
  };
  const borrarIngredienteBase = (id: number) => setIngredientesBase(ingredientesBase.filter(i => i.id!== id));

  const iniciarEdicionPrecio = (ing: IngredienteBase) => {
    setEditandoPrecioId(ing.id);
    setPrecioEditTemp(ing.precioUnitario);
  };
  const guardarPrecioIngrediente = (id: number) => {
    setIngredientesBase(ingredientesBase.map(ing => ing.id === id? {...ing, precioUnitario: precioEditTemp } : ing));
    setEditandoPrecioId(null);
  };

  const agregarIngredienteAPlato = () => setIngredientesPlato([...ingredientesPlato, { ingredienteId: ingredientesBase[0]?.id || 0, cantidad: 0.2 }]);

  const actualizarIngredientePlato = (i: number, campo: string, valor: any) => {
    const nuevos = [...ingredientesPlato];
    if (campo === "cantidad") {
      const valorStr = String(valor);
      const valorNum = Number(valor);
      if (valorStr === "" || valorNum === 0) {
        nuevos[i] = {...nuevos[i], cantidad: 0};
      } else if (valorNum > 0) {
        nuevos[i] = {...nuevos[i], cantidad: valorNum};
      }
    } else {
      nuevos[i] = {...nuevos[i], [campo]: valor};
    }
    setIngredientesPlato(nuevos);
  };

  const borrarIngredienteDePlato = (i: number) => {
    if (ingredientesPlato.length === 1) return;
    setIngredientesPlato(ingredientesPlato.filter((_, idx) => idx!== i));
    const nuevasBusquedas = {...busquedasPorFila};
    delete nuevasBusquedas[i];
    setBusquedasPorFila(nuevasBusquedas);
  };

  const crearOActualizarPlato = () => {
    if (!nombrePlato || ingredientesPlato.length === 0) return;
    if (editandoId) {
      setPlatos(platos.map(p => p.id === editandoId? {...p, nombre: nombrePlato, foto: fotoPlato, ganancia, ingredientes: ingredientesPlato, porciones } : p));
      setEditandoId(null);
    } else {
      setPlatos([...platos, { id: Date.now(), nombre: nombrePlato, foto: fotoPlato, ganancia, ingredientes: ingredientesPlato, porciones }]);
    }
    setNombrePlato("");
    setFotoPlato("");
    setGanancia(50);
    setPorciones(1);
    setIngredientesPlato([]);
    setBusquedasPorFila({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const editarPlato = (plato: Plato) => {
    setNombrePlato(plato.nombre);
    setFotoPlato(plato.foto);
    setGanancia(plato.ganancia);
    setIngredientesPlato(plato.ingredientes);
    setPorciones(plato.porciones || 1);
    setEditandoId(plato.id);
    setBusquedasPorFila({});
    const esDulce = esPlatoDulce(plato.nombre);
    setSubTabPlatos(esDulce? 'dulces' : 'salados');
    setTab('platos');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const borrarPlato = (id: number) => setPlatos(platos.filter(p => p.id!== id));

  const agregarItemPedido = () => {
    if (platos.length === 0) return;
    setItemsPedido([...itemsPedido, { platoId: platos[0].id, cantidad: 1 }]);
  };

  const actualizarItemPedido = (i: number, campo: string, valor: any) => {
    const nuevos = [...itemsPedido];
    if (campo === "cantidad") {
      const valorStr = String(valor);
      const valorNum = Number(valor);
      if (valorStr === "" || valorNum === 0) {
        nuevos[i] = {...nuevos[i], cantidad: 0};
      } else if (valorNum >= 1) {
        nuevos[i] = {...nuevos[i], cantidad: valorNum};
      }
    } else {
      nuevos[i] = {...nuevos[i], [campo]: valor};
    }
    setItemsPedido(nuevos);
  };

  const borrarItemPedido = (i: number) => {
    if (itemsPedido.length === 1) return;
    setItemsPedido(itemsPedido.filter((_, idx) => idx!== i));
  };

  const crearPedido = () => {
    if (!cliente ||!direccion ||!telefono || itemsPedido.length === 0) return;

    const itemsSnapshot: ItemPedidoSnapshot[] = itemsPedido.map(item => {
      const plato = platos.find(p => p.id === item.platoId);
      if (!plato) throw new Error("Plato no encontrado");

      const costoUnit = totalPlato(plato.ingredientes);
      const precioUnit = precioVenta(costoUnit, plato.ganancia);

      const ingSnapshot = plato.ingredientes.map(ingPlato => {
        const ingBase = getIngrediente(ingPlato.ingredienteId);
        return {
          nombre: ingBase?.nombre || "",
          cantidad: ingPlato.cantidad,
          unidad: ingBase?.unidad || "",
          precioUnitario: ingBase?.precioUnitario || 0
        };
      });

      return {
        platoId: plato.id,
        nombrePlato: plato.nombre,
        cantidad: item.cantidad,
        costoUnitario: costoUnit,
        precioVentaUnitario: precioUnit,
        ganancia: plato.ganancia,
        ingredientes: ingSnapshot
      };
    });

    const total = itemsSnapshot.reduce((sum, item) => sum + item.precioVentaUnitario * item.cantidad, 0);
    const costoTotal = itemsSnapshot.reduce((sum, item) => sum + item.costoUnitario * item.cantidad, 0);

    setPedidos([{
      id: Date.now(),
      fecha: new Date().toLocaleString('es-AR'),
      cliente,
      direccion,
      telefono,
      items: itemsSnapshot,
      total,
      costoTotal
    },...pedidos]);

    setCliente("");
    setDireccion("");
    setTelefono("");
    setItemsPedido([]);
  };

  const borrarPedido = (id: number) => setPedidos(pedidos.filter(p => p.id!== id));

  const getIngrediente = (id: number) => ingredientesBase.find(i => i.id === id);
  const calcularPrecioIngrediente = (ingPlato: IngredientePlato) => {
    const ingBase = getIngrediente(ingPlato.ingredienteId);
    if (!ingBase) return 0;
    return ingPlato.cantidad * ingBase.precioUnitario;
  };

  const obtenerCantidadParaMostrar = (ingPlato: IngredientePlato) => {
    const ingBase = getIngrediente(ingPlato.ingredienteId);
    if (!ingBase) return { cantidad: 0, unidad: '' };
    if ((ingBase.unidad === 'kg' || ingBase.unidad === 'L') && ingPlato.cantidad < 1) {
      return { cantidad: ingPlato.cantidad * 1000, unidad: ingBase.unidad === 'kg'? 'g' : 'ml' };
    }
    return { cantidad: ingPlato.cantidad, unidad: ingBase.unidad };
  };

  const esPlatoDulce = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    const palabrasDulces = ['torta', 'brownie', 'chocotorta', 'alfajor', 'cheesecake', 'mousse', 'postre', 'budin', 'cupcake', 'lemon', 'chocolate'];
    return palabrasDulces.some(p => nombreLower.includes(p));
  };

  const platosFiltrados = platos.filter(p => {
    const esDulce = esPlatoDulce(p.nombre);
    return subTabPlatos === 'dulces'? esDulce :!esDulce;
  });

  const ingredientesBaseFiltrados = ingredientesBase.filter(ing =>
    ing.nombre.toLowerCase().includes(busquedaIng.toLowerCase())
  );

  const totalPlato = (ings: IngredientePlato[]) => ings.reduce((sum, ingPlato) => sum + calcularPrecioIngrediente(ingPlato), 0);
  const precioVenta = (costo: number, gan: number) => costo * (1 + gan / 100);
  const gananciaPesos = (costo: number, gan: number) => costo * gan / 100;
  const costoPorcion = (costo: number, porc: number) => porc > 0? costo / porc : 0;

  const gananciaTotal = pedidos.reduce((sum, ped) => sum + (ped.total - ped.costoTotal), 0);
  const costoTotal = pedidos.reduce((sum, ped) => sum + ped.costoTotal, 0);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <title>Tiana - Control de costos</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 md:mb-8 flex items-center gap-3">
            <img
              src="/tiana-logo.png"
              alt="Tiana"
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Tiana</h1>
              <p className="text-slate-400 text-sm md:text-base mt-1">Control de costos, platos y pedidos</p>
            </div>
          </div>

          <div className="flex gap-1 md:gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
            <button onClick={() => setTab('ingredientes')} className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium transition border-b-2 whitespace-nowrap ${tab === 'ingredientes'? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Ingredientes</button>
            <button onClick={() => setTab('platos')} className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium transition border-b-2 whitespace-nowrap ${tab === 'platos'? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Platos</button>
            <button onClick={() => setTab('pedidos')} className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium transition border-b-2 whitespace-nowrap ${tab === 'pedidos'? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Pedidos</button>
            <button onClick={() => setTab('estadisticas')} className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium transition border-b-2 whitespace-nowrap ${tab === 'estadisticas'? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Estadísticas</button>
          </div>

          {tab === 'ingredientes' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border-slate-700 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Gestión de Ingredientes</h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                <input placeholder="Nombre del ingrediente" value={nombreIng} onChange={e => setNombreIng(e.target.value)} className="bg-slate-900 border-slate-600 p-3 md:col-span-5 rounded-lg outline-none text-white placeholder-slate-500 focus:border-teal-500" />
                <div className="relative md:col-span-3">
                  <span className="absolute left-3 top-3 text-slate-500">$</span>
                  <input type="number" placeholder="Precio" value={precioIng} onChange={e => {
                    const val = e.target.value;
                    if (val === "") setPrecioIng(0);
                    else if (precioIng === 0) setPrecioIng(Number(val));
                    else setPrecioIng(Number(val));
                  }} className="bg-slate-900 border-slate-600 p-3 pl-7 w-full rounded-lg outline-none text-white placeholder-slate-500 focus:border-teal-500" />
                </div>
                <select value={unidadIng} onChange={e => setUnidadIng(e.target.value)} className="bg-slate-900 border-slate-600 p-3 md:col-span-2 rounded-lg outline-none text-white focus:border-teal-500">
                  <option value="kg">kg</option>
                  <option value="L">L</option>
                  <option value="unid">unid</option>
                </select>
                <button onClick={agregarIngredienteBase} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-bold md:col-span-2 transition text-xl">+</button>
              </div>

              <input
                placeholder="🔍 Buscar ingrediente..."
                value={busquedaIng}
                onChange={e => setBusquedaIng(e.target.value)}
                className="bg-slate-900 border-slate-600 p-3 w-full mb-4 rounded-lg outline-none text-white placeholder-slate-500 focus:border-teal-500"
              />

              <div className="space-y-2">
                {ingredientesBaseFiltrados.length === 0 && <p className="text-slate-400 text-center py-8">No hay ingredientes cargados</p>}
                {ingredientesBaseFiltrados.map(ing => (
                  <div key={ing.id} className="bg-slate-900/50 rounded-lg p-4 flex-col md:flex-row md:justify-between md:items-center gap-2 border-slate-700">
                    <div className="flex-1">
                      <span className="text-white font-medium block">{ing.nombre}</span>
                      {editandoPrecioId === ing.id? (
                        <div className="flex flex-wrap items-center mt-2 gap-2">
                          <span className="text-slate-400">$</span>
                          <input type="number" value={precioEditTemp} onChange={e => {
                            const val = e.target.value;
                            if (val === "") setPrecioEditTemp(0);
                            else if (precioEditTemp === 0) setPrecioEditTemp(Number(val));
                            else setPrecioEditTemp(Number(val));
                          }} className="bg-slate-800 border-slate-600 p-1 w-24 rounded text-white" />
                          <span className="text-slate-400">por {ing.unidad}</span>
                          <button onClick={() => guardarPrecioIngrediente(ing.id)} className="text-teal-400 hover:text-teal-300 text-sm">Guardar</button>
                          <button onClick={() => setEditandoPrecioId(null)} className="text-slate-400 hover:text-white text-sm">Cancelar</button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">${ing.precioUnitario} por {ing.unidad}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => iniciarEdicionPrecio(ing)} className="text-teal-400 hover:text-teal-300 px-3 py-1 text-sm">Editar precio</button>
                      <button onClick={() => borrarIngredienteBase(ing.id)} className="text-red-400 hover:text-red-300 px-3 py-1 text-sm">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'platos' && (
            <>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border-slate-700 p-4 md:p-6 mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">{editandoId? "Editar Plato" : "Nuevo Plato"}</h2>
                {ingredientesBase.length === 0 && <div className="bg-amber-900/30 border-amber-700 rounded-lg p-4 mb-4"><p className="text-amber-300 text-sm">Debe cargar ingredientes antes de crear platos</p></div>}
                <input placeholder="Nombre del plato" value={nombrePlato} onChange={e => setNombrePlato(e.target.value)} className="bg-slate-900 border-slate-600 p-3 w-full mb-4 rounded-lg outline-none text-white placeholder-slate-500 focus:border-teal-500" disabled={ingredientesBase.length === 0} />

                <div className="mb-4">
                  <label className="text-slate-300 font-medium mb-2 block">Foto del plato</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={manejarSubidaImagen}
                    className="bg-slate-900 border-slate-600 p-3 w-full rounded-lg outline-none text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                    disabled={ingredientesBase.length === 0}
                  />
                </div>

                {fotoPlato && <img src={fotoPlato} alt="preview" className="w-full h-48 object-cover rounded-lg mb-5 border-slate-700" />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-slate-300 font-medium mb-2 block">Margen de ganancia: {ganancia}%</label>
                    <input type="range" min="0" max="200" value={ganancia} onChange={e => setGanancia(Number(e.target.value))} className="w-full accent-teal-500" disabled={ingredientesBase.length === 0} />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium mb-2 block">¿Para cuántas porciones es la receta?</label>
                    <input type="number" min="1" value={porciones} onChange={e => setPorciones(Number(e.target.value))} className="bg-slate-900 border-slate-600 p-3 w-full rounded-lg outline-none text-white focus:border-teal-500" disabled={ingredientesBase.length === 0} />
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {ingredientesPlato.map((ingPlato, i) => {
                    const precio = calcularPrecioIngrediente(ingPlato);
                    return (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-13 gap-2 items-start md:items-center">
                        <input
                          type="text"
                          placeholder="🔍 Buscar ingrediente..."
                          value={busquedasPorFila[i] || ''}
                          onChange={e => setBusquedasPorFila({...busquedasPorFila, [i]: e.target.value})}
                          className="bg-slate-900 border-slate-600 p-2 rounded-lg outline-none text-white placeholder-slate-500 focus:border-teal-500 mb-2 md:col-span-13"
                          disabled={ingredientesBase.length === 0}
                        />
                        <select value={ingPlato.ingredienteId} onChange={e => actualizarIngredientePlato(i, "ingredienteId", Number(e.target.value))} className="bg-slate-900 border-slate-600 p-3 md:col-span-6 rounded-lg outline-none text-white focus:border-teal-500" disabled={ingredientesBase.length === 0}>
                          {ingredientesBase
                          .filter(ing => ing.nombre.toLowerCase().includes((busquedasPorFila[i] || '').toLowerCase()))
                          .map(ing => <option key={ing.id} value={ing.id}>{ing.nombre} - ${ing.precioUnitario}/{ing.unidad}</option>)}
                        </select>
                        <input type="number" step="0.01" placeholder="Cantidad" value={ingPlato.cantidad} onChange={e => actualizarIngredientePlato(i, "cantidad", e.target.value)} className="bg-slate-900 border-slate-600 p-3 md:col-span-4 rounded-lg outline-none text-white focus:border-teal-500" disabled={ingredientesBase.length === 0} />
                        <div className="md:col-span-2 text-left md:text-right"><span className="text-teal-400 font-medium">${precio.toFixed(2)}</span></div>
                        <button onClick={() => borrarIngredienteDePlato(i)} disabled={ingredientesPlato.length === 1} className="text-red-400 hover:text-red-300 text-sm disabled:opacity-30 mt-2 md:mt-0">Eliminar</button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={agregarIngredienteAPlato} className="text-teal-400 font-medium mb-5 hover:text-teal-300 disabled:opacity-50" disabled={ingredientesBase.length === 0}>+ Agregar ingrediente</button>

                {ingredientesPlato.length > 0 && porciones > 0 && (
                  <div className="bg-teal-900/30 border-teal-700 rounded-lg p-4 mb-5">
                    <p className="text-teal-300 text-sm">Costo total receta: <span className="font-bold">${totalPlato(ingredientesPlato).toFixed(2)}</span></p>
                    <p className="text-teal-300 text-sm">Costo porción: <span className="font-bold text-lg">${costoPorcion(totalPlato(ingredientesPlato), porciones).toFixed(2)}</span></p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-3">
                  <button onClick={crearOActualizarPlato} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition" disabled={ingredientesBase.length === 0}>
                    {editandoId? "Guardar cambios" : "Crear plato"}
                  </button>
                  {editandoId && <button onClick={() => setEditandoId(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition">Cancelar</button>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 mb-4 border-b border-slate-700">
                  <button onClick={() => setSubTabPlatos('salados')} className={`px-4 py-2 text-sm font-medium transition border-b-2 ${subTabPlatos === 'salados'? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Salados</button>
                  <button onClick={() => setSubTabPlatos('dulces')} className={`px-4 py-2 text-sm font-medium transition border-b-2 ${subTabPlatos === 'dulces'? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-white'}`}>Dulces</button>
                </div>

                <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Listado de Platos - {subTabPlatos === 'salados'? 'Salados' : 'Dulces'}</h2>
                {platosFiltrados.length === 0 && <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border-slate-700 p-8 md:p-12 text-center"><p className="text-slate-400">No hay platos {subTabPlatos} cargados</p></div>}

                {platosFiltrados.map((p) => {
                  const costo = totalPlato(p.ingredientes);
                  const venta = precioVenta(costo, p.ganancia);
                  const ganancia$ = gananciaPesos(costo, p.ganancia);
                  const costoPorcionCalculado = costoPorcion(costo, p.porciones || 1);
                  const abierto = platoAbierto === p.id;

                  return (
                    <div key={p.id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border-slate-700 overflow-hidden">
                      <button
                        onClick={() => setPlatoAbierto(abierto? null : p.id)}
                        className="w-full p-4 md:p-6 flex justify-between items-center hover:bg-slate-700/30 transition"
                      >
                        <div className="flex gap-3 md:gap-4 items-center text-left">
                          {p.foto && <img src={p.foto} alt={p.nombre} className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover" />}
                          <div>
                            <h3 className="font-semibold text-base md:text-lg text-white">{p.nombre}</h3>
                            <div className="flex flex-col md:flex-row gap-1 md:gap-4 mt-1 text-xs md:text-sm">
                              <span className="text-slate-400">Costo: <span className="text-white">${costo.toFixed(2)}</span></span>
                              <span className="text-slate-400">Por porción: <span className="text-emerald-400">${costoPorcionCalculado.toFixed(2)}</span></span>
                              <span className="text-slate-400">Venta: <span className="text-teal-400 font-bold">${venta.toFixed(0)}</span></span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-slate-400 transition-transform ${abierto? 'rotate-180' : ''}`}>▼</span>
                      </button>

                      {abierto && (
                        <div className="px-4 md:px-6 pb-4 md:pb-6">
                          <div className="space-y-2 mb-4 pt-4 border-t border-slate-700">
                            {p.ingredientes.map((ingPlato, i) => {
                              const ing = getIngrediente(ingPlato.ingredienteId);
                              if (!ing) return null;
                              const precio = calcularPrecioIngrediente(ingPlato);
                              const { cantidad: mostrarCant, unidad: mostrarUnidad } = obtenerCantidadParaMostrar(ingPlato);
                              return <div key={i} className="bg-slate-900/50 rounded p-3 flex-col md:flex-row md:justify-between gap-1 text-sm border-slate-700"><span className="text-slate-300">{ing.nombre}</span><span className="text-slate-400">{mostrarCant}{mostrarUnidad} = ${precio.toFixed(2)}</span></div>;
                            })}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700 mb-4">
                            <div><p className="text-slate-400 text-sm">Costo Total</p><p className="text-base md:text-lg font-semibold text-white">${costo.toFixed(2)}</p></div>
                            <div><p className="text-slate-400 text-sm">Porciones</p><p className="text-base md:text-lg font-semibold text-white">{p.porciones || 1}</p></div>
                            <div><p className="text-slate-400 text-sm">Costo Porción</p><p className="text-base md:text-lg font-semibold text-emerald-400">${costoPorcionCalculado.toFixed(2)}</p></div>
                            <div><p className="text-slate-400 text-sm">Precio Venta</p><p className="text-base md:text-lg font-bold text-teal-400">${venta.toFixed(0)}</p></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={(e) => {e.stopPropagation(); editarPlato(p)}} className="text-teal-400 hover:text-teal-300 text-sm font-medium">Editar</button>
                            <button onClick={(e) => {e.stopPropagation(); borrarPlato(p.id)}} className="text-red-400 hover:text-red-300 text-sm font-medium">Eliminar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'pedidos' && (
            <>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border-slate-700 p-4 md:p-6 mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Nuevo Pedido</h2>
                {platos.length === 0 && <div className="bg-amber-900/30 border-amber-700 rounded-lg p-4 mb-4"><p className="text-amber-300 text-sm">Debe cargar platos antes de crear pedidos</p></div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <input placeholder="Nombre del cliente" value={cliente} onChange={e => setCliente(e.target.value)} className="bg-slate-900 border-slate-600 p-3 rounded-lg outline-none text-white placeholder-slate-500 focus:border-teal-500" disabled={platos.length === 0} />
                  <input placeholder="Dirección de entrega" value={direccion} onChange={e => setDireccion(e.target.value)} className="bg-slate-900 border-slate-600 p-3 rounded-lg outline-none text-white placeholder-slate-500 focus:border-teal-500" disabled={platos.length === 0} />
                  <input placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} className="bg-slate-900 border-slate-600 p-3 rounded-lg outline-none text-white placeholder-slate-500 focus:border-teal-500" disabled={platos.length === 0} />
                </div>
                <div className="space-y-3 mb-5">
                  {itemsPedido.map((item, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-13 gap-2 items-start md:items-center">
                      <select value={item.platoId} onChange={e => actualizarItemPedido(i, "platoId", Number(e.target.value))} className="bg-slate-900 border-slate-600 p-3 md:col-span-9 rounded-lg outline-none text-white focus:border-teal-500" disabled={platos.length === 0}>
                        {platos.map(plato => {
                          const costo = totalPlato(plato.ingredientes);
                          const precio = precioVenta(costo, plato.ganancia);
                          return <option key={plato.id} value={plato.id}>{plato.nombre} - ${precio.toFixed(0)}</option>;
                        })}
                      </select>
                      <input type="number" min="1" value={item.cantidad} onChange={e => actualizarItemPedido(i, "cantidad", e.target.value)} className="bg-slate-900 border-slate-600 p-3 md:col-span-3 rounded-lg outline-none text-white focus:border-teal-500" disabled={platos.length === 0} />
                      <button onClick={() => borrarItemPedido(i)} disabled={itemsPedido.length === 1} className="text-red-400 hover:text-red-300 text-sm disabled:opacity-30 mt-2 md:mt-0">X</button>
                    </div>
                  ))}
                </div>
                <button onClick={agregarItemPedido} className="text-teal-400 font-medium mb-5 hover:text-teal-300 disabled:opacity-50" disabled={platos.length === 0}>+ Agregar plato</button>
                <div className="bg-slate-900/50 rounded-lg p-4 mb-5 border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">Total del pedido:</p>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    ${itemsPedido.reduce((sum, item) => {
                      const plato = platos.find(p => p.id === item.platoId);
                      if (!plato) return sum;
                      const costo = totalPlato(plato.ingredientes);
                      const precio = precioVenta(costo, plato.ganancia);
                      return sum + precio * item.cantidad;
                    }, 0).toFixed(0)}
                  </p>
                </div>
                <button onClick={crearPedido} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 w-full transition" disabled={platos.length === 0 ||!cliente ||!direccion ||!telefono}>
                  Confirmar Pedido
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Historial de Pedidos</h2>
                {pedidos.length === 0 && <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border-slate-700 p-8 md:p-12 text-center"><p className="text-slate-400">No hay pedidos registrados</p></div>}

                {pedidos.map((ped) => {
                  const abierto = pedidoAbierto === ped.id;
                  const gananciaPed = ped.total - ped.costoTotal;

                  return (
                    <div key={ped.id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border-slate-700 overflow-hidden">
                      <button
                        onClick={() => setPedidoAbierto(abierto? null : ped.id)}
                        className="w-full p-4 md:p-6 flex justify-between items-center hover:bg-slate-700/30 transition"
                      >
                        <div className="text-left">
                          <h3 className="font-semibold text-white">{ped.cliente}</h3>
                          <p className="text-slate-400 text-xs md:text-sm mb-3">{ped.direccion} - {ped.telefono}</p>
                          <p className="text-teal-400 font-bold text-lg">${ped.total.toFixed(0)}</p>
                        </div>
                        <span className={`text-slate-400 transition-transform ${abierto? 'rotate-180' : ''}`}>▼</span>
                      </button>

                      {abierto && (
                        <div className="px-4 md:px-6 pb-4 md:pb-6">
                          <div className="space-y-2 mb-4 pt-4 border-t border-slate-700">
                            {ped.items.map((item, idx) => (
                              <div key={idx} className="bg-slate-900/50 rounded p-3 border-slate-700">
                                <div className="flex justify-between mb-2">
                                  <span className="text-white font-medium">{item.nombrePlato} x{item.cantidad}</span>
                                  <span className="text-teal-400 font-bold">${(item.precioVentaUnitario * item.cantidad).toFixed(0)}</span>
                                </div>
                                <div className="space-y-1 ml-2">
                                  {item.ingredientes.map((ing, i) => {
                                    const cantidadMostrar = (ing.unidad === 'kg' || ing.unidad === 'L') && ing.cantidad < 1? ing.cantidad * 1000 : ing.cantidad;
                                    const unidadMostrar = (ing.unidad === 'kg' && ing.cantidad < 1)? 'g' : (ing.unidad === 'L' && ing.cantidad < 1)? 'ml' : ing.unidad;
                                    return (
                                      <p key={i} className="text-slate-400 text-xs">
                                        {ing.nombre}: {cantidadMostrar}{unidadMostrar}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700 mb-4">
                            <div><p className="text-slate-400 text-sm">Costo</p><p className="text-base md:text-lg font-semibold text-white">${ped.costoTotal.toFixed(2)}</p></div>
                            <div><p className="text-slate-400 text-sm">Ganancia</p><p className="text-base md:text-lg font-semibold text-emerald-400">+${gananciaPed.toFixed(2)}</p></div>
                            <div><p className="text-slate-400 text-sm">Total Venta</p><p className="text-base md:text-lg font-bold text-teal-400">${ped.total.toFixed(0)}</p></div>
                          </div>
                          <button 
                            onClick={(e) => {e.stopPropagation(); borrarPedido(ped.id)}} 
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Eliminar pedido
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'estadisticas' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl border-slate-700 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-6">Estadísticas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border-slate-700">
                  <p className="text-slate-400 text-sm">Total Vendido</p>
                  <p className="text-2xl font-bold text-white">${pedidos.reduce((sum, p) => sum + p.total, 0).toFixed(0)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border-slate-700">
                  <p className="text-slate-400 text-sm">Costo Total</p>
                  <p className="text-2xl font-bold text-white">${costoTotal.toFixed(2)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border-slate-700">
                  <p className="text-slate-400 text-sm">Ganancia Total</p>
                  <p className="text-2xl font-bold text-emerald-400">${gananciaTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}