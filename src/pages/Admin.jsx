import { useEffect, useState } from 'react';
import { Card, Table, Alert, Spinner, Button, Tabs, Tab, Form, Row, Col, Badge } from 'react-bootstrap';
import { API_BASE } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Admin() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('overview');
  const STATUSES = ['created','paid','shipped','delivered','cancelled'];

  // overview
  const [ovrLoading, setOvrLoading] = useState(true);
  const [ovrErr, setOvrErr] = useState('');
  const [overview, setOverview] = useState(null);

  // users
  const [uLoading, setULoading] = useState(true);
  const [uErr, setUErr] = useState('');
  const [users, setUsers] = useState([]);
  const [userQ, setUserQ] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

  // orders
  const [oLoading, setOLoading] = useState(true);
  const [oErr, setOErr] = useState('');
  const [orders, setOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState('');

  // products (solo listado básico)
  const [pLoading, setPLoading] = useState(true);
  const [pErr, setPErr] = useState('');
  const [products, setProducts] = useState([]);
  const [productQ, setProductQ] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    active: true,
    image: null
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFields, setEditFields] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category: '',
    active: true,
    image: null
  });
  const [updatingProduct, setUpdatingProduct] = useState(false);

  useEffect(() => {
    let alive = true;
    async function fetchOverview() {
      setOvrErr(''); setOvrLoading(true);
      try {
        const data = await api.admin.overview(token);
        if (alive) setOverview(data);
      } catch (e) {
        if (alive) setOvrErr(e?.message || 'Error al cargar el resumen');
      } finally {
        if (alive) setOvrLoading(false);
      }
    }
    async function fetchUsers() {
      setUErr(''); setULoading(true);
      try {
        const data = await api.admin.listUsers(token, { q: userQ });
        const items = Array.isArray(data) ? data : (data?.items || []);
        if (alive) setUsers(items);
      } catch (e) {
        if (alive) setUErr(e?.message || 'Error al cargar usuarios');
      } finally {
        if (alive) setULoading(false);
      }
    }
    async function fetchOrders() {
      setOErr(''); setOLoading(true);
      try {
        const data = await api.admin.listOrders(token, { status: orderStatus || undefined });
        const items = Array.isArray(data) ? data : (data?.items || data?.orders || []);
        if (alive) setOrders(items);
      } catch (e) {
        if (alive) setOErr(e?.message || 'Error al cargar pedidos');
      } finally {
        if (alive) setOLoading(false);
      }
    }
    async function fetchProducts() {
      setPErr(''); setPLoading(true);
      try {
        const data = await api.admin.listProducts(token, { q: productQ });
        const items = Array.isArray(data) ? data : (data?.items || []);
        if (alive) setProducts(items);
      } catch (e) {
        if (alive) setPErr(e?.message || 'Error al cargar productos');
      } finally {
        if (alive) setPLoading(false);
      }
    }
    if (token) {
      fetchOverview();
      fetchUsers();
      fetchOrders();
      fetchProducts();
    }
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDeleteUser(id) {
    if (!id) return;
    if (user && (user.id === id || user._id === id)) {
      window.alert('No podés borrarte a vos mismo.');
      return;
    }
    if (!window.confirm('¿Eliminar este usuario y sus pedidos?')) return;
    try {
      await api.admin.deleteUser(token, id);
      setUsers(prev => prev.filter(u => (u._id || u.id) !== id));
      setOrders(prev => prev.filter(o => String(o.user) !== String(id)));
    } catch (e) {
      window.alert(e?.message || 'No se pudo eliminar.');
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    try {
      const created = await api.admin.createUser(token, newUser);
      setUsers(prev => [created, ...prev]);
      setNewUser({ name: '', email: '', password: '' });
    } catch (e) {
      window.alert(e?.message || 'No se pudo crear el usuario.');
    }
  }

  async function handleUpdateOrderStatus(order, nextStatus) {
    try {
      const updated = await api.admin.updateOrder(token, order._id, { status: nextStatus });
      setOrders(prev => prev.map(o => (o._id === order._id ? updated : o)));
    } catch (e) {
      window.alert(e?.message || 'No se pudo actualizar el estado.');
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    if (!newProduct.name.trim() || newProduct.price === '') {
      window.alert('Nombre y precio son obligatorios.');
      return;
    }
    if (!newProduct.image) {
      window.alert('Debes seleccionar una imagen.');
      return;
    }
    try {
      setCreatingProduct(true);
      const fd = new FormData();
      fd.append('name', newProduct.name.trim());
      fd.append('price', String(newProduct.price));
      if (newProduct.description.trim()) fd.append('description', newProduct.description.trim());
      if (newProduct.category.trim()) fd.append('category', newProduct.category.trim());
      fd.append('stock', newProduct.stock !== '' ? String(newProduct.stock) : '0');
      fd.append('active', newProduct.active ? 'true' : 'false');
      fd.append('image', newProduct.image);
      const created = await api.admin.createProduct(token, fd);
      setProducts(prev => [created, ...prev]);
      setNewProduct({ name: '', price: '', stock: '', description: '', category: '', active: true, image: null });
      setShowProductForm(false);
    } catch (e) {
      window.alert(e?.message || 'No se pudo crear el producto.');
    } finally {
      setCreatingProduct(false);
    }
  }

  function startEditingProduct(prod) {
    if (!prod) return;
    setEditingProduct(prod);
    setEditFields({
      name: prod.name || '',
      price: String(prod.price ?? prod.precio ?? ''),
      stock: String(prod.stock ?? ''),
      description: prod.description || '',
      category: typeof prod.category === 'object' ? (prod.category?._id || prod.category?.name || '') : (prod.category || ''),
      active: typeof prod.active === 'boolean' ? prod.active : !!prod.active,
      image: null
    });
  }

  function cancelEditingProduct() {
    setEditingProduct(null);
    setEditFields({
      name: '',
      price: '',
      stock: '',
      description: '',
      category: '',
      active: true,
      image: null
    });
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editFields.name.trim() || editFields.price === '') {
      window.alert('Nombre y precio son obligatorios.');
      return;
    }
    try {
      setUpdatingProduct(true);
      const fd = new FormData();
      fd.append('name', editFields.name.trim());
      fd.append('price', String(editFields.price));
      fd.append('stock', editFields.stock !== '' ? String(editFields.stock) : '0');
      fd.append('active', editFields.active ? 'true' : 'false');
      if (editFields.description.trim()) fd.append('description', editFields.description.trim());
      if (editFields.category.trim()) fd.append('category', editFields.category.trim());
      if (editFields.image) fd.append('image', editFields.image);
      const id = editingProduct._id || editingProduct.id;
      const updated = await api.admin.updateProduct(token, id, fd);
      setProducts(prev => prev.map(p => ((p._id || p.id) === (updated._id || updated.id) ? updated : p)));
      cancelEditingProduct();
    } catch (e) {
      window.alert(e?.message || 'No se pudo actualizar el producto.');
    } finally {
      setUpdatingProduct(false);
    }
  }

  async function handleDeleteProduct(prod) {
    const id = prod?._id || prod?.id;
    if (!id) return;
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.admin.deleteProduct(token, id);
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
      if (editingProduct && (editingProduct._id || editingProduct.id) === id) {
        cancelEditingProduct();
      }
    } catch (e) {
      window.alert(e?.message || 'No se pudo eliminar el producto.');
    }
  }

  if (user && user.role !== 'admin') {
    return <Alert variant="warning" className="m-3">Acceso restringido.</Alert>;
  }

  return (
    <div className="container my-4">
      <Card>
        <Card.Header><strong>Panel de administración</strong></Card.Header>
        <Card.Body>
          <Tabs activeKey={tab} onSelect={(k) => setTab(k || 'overview')} className="mb-3">
            <Tab eventKey="overview" title="Resumen">
              {ovrErr && <Alert variant="danger" className="mb-3">{ovrErr}</Alert>}
              {ovrLoading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                overview && (
                  <>
                    <Row className="g-3 mb-3">
                      <Col md>
                        <Card className="h-100"><Card.Body>
                          <div className="text-muted">Usuarios</div>
                          <div className="fs-3 fw-bold">{overview.counts?.users ?? '-'}</div>
                        </Card.Body></Card>
                      </Col>
                      <Col md>
                        <Card className="h-100"><Card.Body>
                          <div className="text-muted">Productos</div>
                          <div className="fs-3 fw-bold">{overview.counts?.products ?? '-'}</div>
                        </Card.Body></Card>
                      </Col>
                      <Col md>
                        <Card className="h-100"><Card.Body>
                          <div className="text-muted">Pedidos (30d)</div>
                          <div className="fs-5">{overview.last30d?.orders ?? 0} pedidos</div>
                          <div className="text-success fw-bold">${overview.last30d?.revenue?.toFixed ? overview.last30d.revenue.toFixed(2) : overview.last30d?.revenue || 0}</div>
                        </Card.Body></Card>
                      </Col>
                    </Row>
                    <h6 className="mb-2">Últimos pedidos</h6>
                    <Table size="sm" striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Usuario</th>
                          <th>Monto</th>
                          <th>Estado</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(overview.lastOrders || []).map(o => (
                          <tr key={o._id}>
                            <td>{o._id}</td>
                            <td>{o.user?.name || o.user?.email || String(o.user)}</td>
                            <td>${o.totals?.amount}</td>
                            <td><Badge bg="secondary">{o.status}</Badge></td>
                            <td>{new Date(o.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                        {(!overview.lastOrders || overview.lastOrders.length===0) && (
                          <tr><td colSpan={5} className="text-center py-3">Sin datos.</td></tr>
                        )}
                      </tbody>
                    </Table>
                  </>
                )
              )}
            </Tab>

            <Tab eventKey="users" title="Usuarios">
              {uErr && <Alert variant="danger" className="mb-3">{uErr}</Alert>}
              <Form onSubmit={(e)=>{e.preventDefault();}} className="mb-2">
                <Row className="g-2 align-items-end">
                  <Col md>
                    <Form.Label>Buscar</Form.Label>
                    <Form.Control placeholder="Nombre o email" value={userQ} onChange={e=>setUserQ(e.target.value)} />
                  </Col>
                  <Col md="auto" className="pt-4">
                    <Button variant="outline-primary" onClick={() => {
                      setULoading(true);
                      api.admin.listUsers(token, { q: userQ })
                        .then(data => setUsers(Array.isArray(data) ? data : (data?.items || [])))
                        .catch(()=>{})
                        .finally(()=>setULoading(false));
                    }}>Buscar</Button>
                  </Col>
                </Row>
              </Form>
              <Form onSubmit={handleCreateUser} className="mb-3">
                <Row className="g-2 align-items-end">
                  <Col md>
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control value={newUser.name} onChange={e=>setNewUser(v=>({...v, name:e.target.value}))} required />
                  </Col>
                  <Col md>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={newUser.email} onChange={e=>setNewUser(v=>({...v, email:e.target.value}))} required />
                  </Col>
                  <Col md>
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control type="password" value={newUser.password} onChange={e=>setNewUser(v=>({...v, password:e.target.value}))} required />
                  </Col>
                  <Col md="auto">
                    <Button type="submit">Crear usuario</Button>
                  </Col>
                </Row>
              </Form>
              {uLoading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Teléfono</th>
                      <th>Dirección</th>
                      <th>Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const id = u._id || u.id;
                      let avatar = u.profile?.avatar || '';
                      if (avatar && avatar.startsWith('/')) avatar = `${API_BASE}${avatar}`;
                      const phone = u.profile?.phone || u.shipping?.phone || '';
                      const addr = [u.shipping?.address, u.shipping?.city, u.shipping?.zip].filter(Boolean).join(', ');
                      return (
                        <tr key={id}>
                          <td>{avatar ? <img src={avatar} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} /> : null}</td>
                          <td>{u.name || '-'}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>{phone}</td>
                          <td>{addr || '-'}</td>
                          <td>{new Date(u.createdAt).toLocaleString()}</td>
                          <td className="text-end">
                            <Button size="sm" variant="outline-danger" onClick={() => handleDeleteUser(id)}>Borrar</Button>
                          </td>
                        </tr>
                      );
                    })}
                    {users.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-3">Sin usuarios.</td></tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Tab>

            <Tab eventKey="orders" title="Pedidos">
              {oErr && <Alert variant="danger" className="mb-3">{oErr}</Alert>}
              <Form onSubmit={(e)=>e.preventDefault()} className="mb-2">
                <Row className="g-2 align-items-end">
                  <Col md>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select value={orderStatus} onChange={e=>setOrderStatus(e.target.value)}>
                      <option value="">Todos</option>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md="auto" className="pt-4">
                    <Button variant="outline-primary" onClick={() => {
                      setOLoading(true);
                      api.admin.listOrders(token, { status: orderStatus || undefined })
                        .then(data => setOrders(Array.isArray(data) ? data : (data?.items || data?.orders || [])))
                        .catch(()=>{})
                        .finally(()=>setOLoading(false));
                    }}>Filtrar</Button>
                  </Col>
                </Row>
              </Form>
              {oLoading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td>{o._id}</td>
                        <td>{o.user?.name || o.user?.email || String(o.user)}</td>
                        <td>${o.totals?.amount}</td>
                        <td>{o.status}</td>
                        <td>{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="text-end">
                          <Form.Select size="sm" style={{maxWidth:160, display:'inline-block'}} value={o.status} onChange={e=>handleUpdateOrderStatus(o, e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </Form.Select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-3">Sin pedidos.</td></tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Tab>

            <Tab eventKey="products" title="Productos">
              {pErr && <Alert variant="danger" className="mb-3">{pErr}</Alert>}
              <Form onSubmit={(e)=>{e.preventDefault();}} className="mb-2">
                <Row className="g-2 align-items-end">
                  <Col md>
                    <Form.Label>Buscar</Form.Label>
                    <Form.Control placeholder="Nombre" value={productQ} onChange={e=>setProductQ(e.target.value)} />
                  </Col>
                  <Col md="auto" className="pt-4">
                    <Button variant="outline-primary" onClick={() => {
                      setPLoading(true);
                      api.admin.listProducts(token, { q: productQ })
                        .then(data => setProducts(Array.isArray(data) ? data : (data?.items || [])))
                        .catch(()=>{})
                        .finally(()=>setPLoading(false));
                    }}>Buscar</Button>
                  </Col>
                </Row>
              </Form>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="text-muted small">Listado de productos</div>
                <Button onClick={()=>setShowProductForm(v=>!v)}>
                  {showProductForm ? 'Ocultar formulario' : 'Cargar producto'}
                </Button>
              </div>
              {showProductForm && (
                <Card className="mb-3">
                  <Card.Body>
                    <Form onSubmit={handleCreateProduct}>
                      <Row className="g-3">
                        <Col md>
                          <Form.Group controlId="prodName">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control value={newProduct.name} onChange={e=>setNewProduct(v=>({...v, name:e.target.value}))} required />
                          </Form.Group>
                        </Col>
                        <Col md="auto">
                          <Form.Group controlId="prodPrice">
                            <Form.Label>Precio</Form.Label>
                            <Form.Control type="number" min="0" step="0.01" value={newProduct.price} onChange={e=>setNewProduct(v=>({...v, price:e.target.value}))} required />
                          </Form.Group>
                        </Col>
                        <Col md="auto">
                          <Form.Group controlId="prodStock">
                            <Form.Label>Stock</Form.Label>
                            <Form.Control type="number" min="0" value={newProduct.stock} onChange={e=>setNewProduct(v=>({...v, stock:e.target.value}))} />
                          </Form.Group>
                        </Col>
                        <Col md="auto">
                          <Form.Group controlId="prodActive" className="mt-4 pt-2">
                            <Form.Check type="switch" label="Activo" checked={newProduct.active} onChange={e=>setNewProduct(v=>({...v, active:e.target.checked}))} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="g-3 mt-1">
                        <Col md>
                          <Form.Group controlId="prodDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control as="textarea" rows={2} value={newProduct.description} onChange={e=>setNewProduct(v=>({...v, description:e.target.value}))} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="g-3 mt-1">
                        <Col md>
                          <Form.Group controlId="prodCategory">
                            <Form.Label>Categoría (opcional)</Form.Label>
                            <Form.Control value={newProduct.category} onChange={e=>setNewProduct(v=>({...v, category:e.target.value}))} />
                          </Form.Group>
                        </Col>
                        <Col md>
                          <Form.Group controlId="prodImage">
                            <Form.Label>Imagen</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={e=>setNewProduct(v=>({...v, image: e.target.files && e.target.files[0] ? e.target.files[0] : null}))} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="mt-3 text-end">
                        <Button type="submit" disabled={creatingProduct}>
                          {creatingProduct ? 'Guardando...' : 'Guardar producto'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              )}
              {editingProduct && (
                <Card className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <strong>Editar producto</strong>
                      <Button variant="outline-secondary" size="sm" type="button" onClick={cancelEditingProduct}>Cancelar</Button>
                    </div>
                    <Form onSubmit={handleUpdateProduct}>
                      <Row className="g-3">
                        <Col md>
                          <Form.Group controlId="editName">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control value={editFields.name} onChange={e=>setEditFields(v=>({...v, name:e.target.value}))} required />
                          </Form.Group>
                        </Col>
                        <Col md="auto">
                          <Form.Group controlId="editPrice">
                            <Form.Label>Precio</Form.Label>
                            <Form.Control type="number" min="0" step="0.01" value={editFields.price} onChange={e=>setEditFields(v=>({...v, price:e.target.value}))} required />
                          </Form.Group>
                        </Col>
                        <Col md="auto">
                          <Form.Group controlId="editStock">
                            <Form.Label>Stock</Form.Label>
                            <Form.Control type="number" min="0" value={editFields.stock} onChange={e=>setEditFields(v=>({...v, stock:e.target.value}))} />
                          </Form.Group>
                        </Col>
                        <Col md="auto">
                          <Form.Group controlId="editActive" className="mt-4 pt-2">
                            <Form.Check type="switch" label="Activo" checked={editFields.active} onChange={e=>setEditFields(v=>({...v, active:e.target.checked}))} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="g-3 mt-1">
                        <Col md>
                          <Form.Group controlId="editDescription">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control as="textarea" rows={2} value={editFields.description} onChange={e=>setEditFields(v=>({...v, description:e.target.value}))} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="g-3 mt-1">
                        <Col md>
                          <Form.Group controlId="editCategory">
                            <Form.Label>Categoría</Form.Label>
                            <Form.Control value={editFields.category} onChange={e=>setEditFields(v=>({...v, category:e.target.value}))} />
                          </Form.Group>
                        </Col>
                        <Col md>
                          <Form.Group controlId="editImage">
                            <Form.Label>Imagen (opcional)</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={e=>setEditFields(v=>({...v, image: e.target.files && e.target.files[0] ? e.target.files[0] : null}))} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <div className="mt-3 text-end">
                        <Button type="submit" disabled={updatingProduct}>
                          {updatingProduct ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              )}
              {pLoading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Activo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      let img = p.imagen || (Array.isArray(p.images) && p.images[0]) || '';
                      if (typeof img === 'string' && img.startsWith('/')) img = `${API_BASE}${img}`;
                      return (
                        <tr key={p._id || p.id}>
                          <td>{img ? <img alt={p.name} src={img} style={{width:40,height:40,objectFit:'cover'}} /> : null}</td>
                          <td>{p.name}</td>
                          <td>${p.price ?? p.precio}</td>
                          <td>{p.stock}</td>
                          <td>{p.active ? 'Sí' : 'No'}</td>
                          <td className="text-end">
                            <Button size="sm" variant="outline-secondary" onClick={() => startEditingProduct(p)}>Editar</Button>
                            <Button size="sm" variant="outline-danger" className="ms-2" onClick={() => handleDeleteProduct(p)}>Eliminar</Button>
                          </td>
                        </tr>
                      );
                    })}
                    {products.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-3">Sin productos.</td></tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}








