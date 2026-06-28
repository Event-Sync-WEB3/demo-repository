'use client';

import { Admin, Resource, ListGuesser, EditGuesser } from 'react-admin';
import { fetchUtils } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const apiUrl = 'http://localhost:4000/api';

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  return fetchUtils.fetchJson(url, options);
};

const dataProvider = {
  ...simpleRestProvider(apiUrl, httpClient),
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
    const url = `${apiUrl}/${resource}?page=${page}&limit=${perPage}`;

    const response = await httpClient(url);
    const total = response.headers.get('X-Total-Count') || 0;

    return {
      data: response.json,
      total: parseInt(total, 10),
    };
  },
};

const AdminApp = () => (
  <Admin dataProvider={dataProvider}>
    <Resource
      name="events"
      list={ListGuesser}
      edit={EditGuesser}
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

export default AdminApp;