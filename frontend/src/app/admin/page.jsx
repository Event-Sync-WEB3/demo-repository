'use client';

import { useState, useEffect } from 'react';
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  Create,
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  SimpleForm,
  TextInput,
  DateInput,
} from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const API_URL = 'http://localhost:4000';

// HTTP client avec token
const httpClient = (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
};

// Data provider complet
const dataProvider = {
  ...simpleRestProvider(API_URL + '/api', httpClient),

  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const url = `${API_URL}/api/${resource}?page=${page}&limit=${perPage}`;

    const response = await httpClient(url);
    const total = response.headers.get('X-Total-Count') || 0;
    const json = await response.json();
    const data = Array.isArray(json) ? json : json.data || [];

    return { data, total: parseInt(total, 10) };
  },

  getOne: async (resource, params) => {
    if (resource === 'events') {
      const listUrl = `${API_URL}/api/events?page=1&limit=100`;
      const listResponse = await httpClient(listUrl);
      const listJson = await listResponse.json();
      const items = Array.isArray(listJson) ? listJson : listJson.data || [];
      const item = items.find(i => i.id === params.id);
      
      if (item?.slug) {
        const url = `${API_URL}/api/events/${item.slug}`;
        const response = await httpClient(url);
        const json = await response.json();
        return { data: { ...json, id: json.id } };
      }
    }

    const url = `${API_URL}/api/${resource}/${params.id}`;
    const response = await httpClient(url);
    const json = await response.json();
    const item = json.data || json;
    return { data: { ...item, id: item.id || params.id } };
  },

  getMany: async (resource, params) => {
    const results = await Promise.all(
      params.ids.map(async (id) => {
        const response = await httpClient(`${API_URL}/api/${resource}/${id}`);
        const json = await response.json();
        const item = json.data || json;
        return { ...item, id: item.id || id };
      })
    );
    return { data: results };
  },

  create: async (resource, params) => {
    if (resource === 'events' && (params.data.rooms || params.data.speakers || params.data.sessions)) {
      // Utiliser l'endpoint full pour la création complète
      const token = localStorage.getItem('adminToken');
      const url = `${API_URL}/api/events/full`;
      const response = await httpClient(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }),
      });
      const json = await response.json();
      return { data: { ...json, id: json.id } };
    }

    const url = `${API_URL}/api/${resource}`;
    const response = await httpClient(url, {
      method: 'POST',
      body: JSON.stringify(params.data),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    const json = await response.json();
    return { data: { ...params.data, id: json.id || json.data?.id } };
  },

  update: async (resource, params) => {
    let updateId = params.id;

    if (resource === 'events') {
      const listUrl = `${API_URL}/api/events?page=1&limit=100`;
      const listResponse = await httpClient(listUrl);
      const listJson = await listResponse.json();
      const items = Array.isArray(listJson) ? listJson : listJson.data || [];
      const item = items.find(i => i.id === params.id);
      if (item?.slug) updateId = item.slug;
    }

    const url = `${API_URL}/api/${resource}/${updateId}`;
    const response = await httpClient(url, {
      method: 'PUT',
      body: JSON.stringify(params.data),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    const json = await response.json();
    const item = json.data || json;
    return { data: { ...item, id: item.id || params.id } };
  },

  delete: async (resource, params) => {
    let deleteId = params.id;

    if (resource === 'events') {
      const listUrl = `${API_URL}/api/events?page=1&limit=100`;
      const listResponse = await httpClient(listUrl);
      const listJson = await listResponse.json();
      const items = Array.isArray(listJson) ? listJson : listJson.data || [];
      const item = items.find(i => i.id === params.id);
      if (item?.slug) deleteId = item.slug;
    }

    const url = `${API_URL}/api/${resource}/${deleteId}`;
    await httpClient(url, { method: 'DELETE' });
    return { data: params.previousData };
  },
};

// Liste des événements
const EventList = () => (
  <List>
    <Datagrid>
      <TextField source="title" label="Titre" />
      <TextField source="location" label="Lieu" />
      <DateField source="startsAt" label="Début" showTime />
      <DateField source="endsAt" label="Fin" showTime />
      <EditButton />
    </Datagrid>
  </List>
);

// Création d'événement complète
const EventCreate = () => {
  const [rooms, setRooms] = useState(['']);
  const [speakers, setSpeakers] = useState([{ fullName: '', bio: '' }]);
  const [sessions, setSessions] = useState([
    { title: '', description: '', startsAt: '', endsAt: '', capacity: '', roomName: '', speakerNames: '' }
  ]);

  const transform = (data) => ({
    ...data,
    rooms: rooms.filter(r => r.trim()),
    speakers: speakers.filter(s => s.fullName.trim()),
    sessions: sessions
      .filter(s => s.title.trim() && s.startsAt && s.endsAt)
      .map(s => ({
        ...s,
        capacity: parseInt(s.capacity) || null,
        speakerNames: s.speakerNames.split(',').map(n => n.trim()).filter(Boolean),
      })),
  });

  return (
    <Create transform={transform}>
      <SimpleForm>
        <h2 style={{ color: '#7c6ff7', fontSize: '16px', marginBottom: '8px' }}>📋 Événement</h2>
        <TextInput source="title" label="Titre" required />
        <TextInput source="description" label="Description" multiline />
        <TextInput source="location" label="Lieu" />
        <DateInput source="startsAt" label="Date de début" required />
        <DateInput source="endsAt" label="Date de fin" required />

        {/* Rooms */}
        <h2 style={{ color: '#7c6ff7', fontSize: '16px', marginTop: '24px', marginBottom: '8px' }}>
          🏠 Salles
          <button type="button" onClick={() => setRooms([...rooms, ''])} style={{
            marginLeft: '12px', padding: '4px 12px', fontSize: '12px',
            background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
          }}>+ Ajouter</button>
        </h2>
        {rooms.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <input
              placeholder="Nom de la salle"
              value={r}
              onChange={e => { const u = [...rooms]; u[i] = e.target.value; setRooms(u); }}
              style={{
                flex: 1, padding: '10px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)', background: '#1c1c24',
                color: '#f2f2f8', fontSize: '14px',
              }}
            />
            {rooms.length > 1 && (
              <button type="button" onClick={() => setRooms(rooms.filter((_, idx) => idx !== i))} style={{
                padding: '6px 10px', background: '#f07060', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
              }}>✕</button>
            )}
          </div>
        ))}

        {/* Speakers */}
        <h2 style={{ color: '#7c6ff7', fontSize: '16px', marginTop: '24px', marginBottom: '8px' }}>
          🎤 Intervenants
          <button type="button" onClick={() => setSpeakers([...speakers, { fullName: '', bio: '' }])} style={{
            marginLeft: '12px', padding: '4px 12px', fontSize: '12px',
            background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
          }}>+ Ajouter</button>
        </h2>
        {speakers.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
            <input
              placeholder="Nom complet"
              value={s.fullName}
              onChange={e => { const u = [...speakers]; u[i].fullName = e.target.value; setSpeakers(u); }}
              style={{
                flex: 1, minWidth: '150px', padding: '10px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)', background: '#1c1c24',
                color: '#f2f2f8', fontSize: '14px',
              }}
            />
            <input
              placeholder="Bio (optionnel)"
              value={s.bio}
              onChange={e => { const u = [...speakers]; u[i].bio = e.target.value; setSpeakers(u); }}
              style={{
                flex: 2, minWidth: '200px', padding: '10px', borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)', background: '#1c1c24',
                color: '#f2f2f8', fontSize: '14px',
              }}
            />
            {speakers.length > 1 && (
              <button type="button" onClick={() => setSpeakers(speakers.filter((_, idx) => idx !== i))} style={{
                padding: '6px 10px', background: '#f07060', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
              }}>✕</button>
            )}
          </div>
        ))}

        {/* Sessions */}
        <h2 style={{ color: '#7c6ff7', fontSize: '16px', marginTop: '24px', marginBottom: '8px' }}>
          📅 Sessions
          <button type="button" onClick={() => setSessions([...sessions, { title: '', description: '', startsAt: '', endsAt: '', capacity: '', roomName: '', speakerNames: '' }])} style={{
            marginLeft: '12px', padding: '4px 12px', fontSize: '12px',
            background: '#7c6ff7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
          }}>+ Ajouter</button>
        </h2>
        {sessions.map((s, i) => (
          <div key={i} style={{
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            padding: '12px', marginBottom: '12px', background: '#1c1c24',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6870a0', fontSize: '12px' }}>Session {i + 1}</span>
              {sessions.length > 1 && (
                <button type="button" onClick={() => setSessions(sessions.filter((_, idx) => idx !== i))} style={{
                  padding: '4px 8px', background: '#f07060', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                }}>✕</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input placeholder="Titre" value={s.title}
                onChange={e => { const u = [...sessions]; u[i].title = e.target.value; setSessions(u); }}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f13', color: '#f2f2f8', fontSize: '13px' }} />
              <input placeholder="Salle" value={s.roomName}
                onChange={e => { const u = [...sessions]; u[i].roomName = e.target.value; setSessions(u); }}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f13', color: '#f2f2f8', fontSize: '13px' }} />
              <input type="datetime-local" value={s.startsAt}
                onChange={e => { const u = [...sessions]; u[i].startsAt = e.target.value; setSessions(u); }}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f13', color: '#f2f2f8', fontSize: '13px' }} />
              <input type="datetime-local" value={s.endsAt}
                onChange={e => { const u = [...sessions]; u[i].endsAt = e.target.value; setSessions(u); }}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f13', color: '#f2f2f8', fontSize: '13px' }} />
              <input placeholder="Capacité" type="number" value={s.capacity}
                onChange={e => { const u = [...sessions]; u[i].capacity = e.target.value; setSessions(u); }}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f13', color: '#f2f2f8', fontSize: '13px' }} />
              <input placeholder="Intervenants (noms séparés par virgule)" value={s.speakerNames}
                onChange={e => { const u = [...sessions]; u[i].speakerNames = e.target.value; setSessions(u); }}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f13', color: '#f2f2f8', fontSize: '13px' }} />
            </div>
            <input placeholder="Description" value={s.description}
              onChange={e => { const u = [...sessions]; u[i].description = e.target.value; setSessions(u); }}
              style={{ width: '100%', marginTop: '8px', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f13', color: '#f2f2f8', fontSize: '13px', boxSizing: 'border-box' }} />
          </div>
        ))}
      </SimpleForm>
    </Create>
  );
};

// Édition d'événement
const EventEdit = () => (
  <EditGuesser>
    <SimpleForm>
      <TextInput source="title" label="Titre" />
      <TextInput source="description" label="Description" multiline />
      <TextInput source="location" label="Lieu" />
      <DateInput source="startsAt" label="Date de début" />
      <DateInput source="endsAt" label="Date de fin" />
    </SimpleForm>
  </EditGuesser>
);

// Page de login
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@eventsync.com');
  const [password, setPassword] = useState('hashed_password_123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur de connexion');
        return;
      }

      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      onLogin();
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f13 0%, #1a1c28 100%)',
    }}>
      <div style={{
        background: '#181820',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        width: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#7c6ff7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h1 style={{ color: '#f2f2f8', fontSize: '20px', fontWeight: 600, margin: 0 }}>EventSync Admin</h1>
          <p style={{ color: '#6870a0', fontSize: '13px', marginTop: '8px' }}>Connectez-vous pour gérer vos événements</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#f0706018',
              color: '#f07060',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#6870a0', fontSize: '12px', marginBottom: '6px', display: 'block' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#1c1c24',
                color: '#f2f2f8',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#6870a0', fontSize: '12px', marginBottom: '6px', display: 'block' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#1c1c24',
                color: '#f2f2f8',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#7c6ff7',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

// Auth provider
const authProvider = {
  login: async () => {
    const token = localStorage.getItem('adminToken');
    if (token) return Promise.resolve();
    return Promise.reject();
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    return Promise.resolve();
  },
  checkAuth: () => {
    return localStorage.getItem('adminToken') ? Promise.resolve() : Promise.reject();
  },
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

// App principale
const AdminApp = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      setLoggedIn(true);
    }
  }, []);

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      requireAuth
    >
      <Resource
        name="events"
        list={EventList}
        edit={EventEdit}
        create={EventCreate}
      />
      <Resource
        name="sessions"
        list={ListGuesser}
        edit={EditGuesser}
      />
      <Resource
        name="speakers"
        list={ListGuesser}
        edit={EditGuesser}
      />
      <Resource
        name="rooms"
        list={ListGuesser}
        edit={EditGuesser}
      />
    </Admin>
  );
};

export default AdminApp;