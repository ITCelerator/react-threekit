import http from '../http';
import connection from '../connection';
import FormData from 'form-data';

export const fetchList = () =>
  new Promise(async (resolve, reject) => {
    const response = await http.datatables.getDatatablesList();
    resolve(response.data.datatables);
  });

export const fetchDatatable = (datatableId, options) =>
  new Promise(async (resolve, reject) => {
    const { format } = Object.assign({ format: 'csv' }, options);

    let output;

    try {
      switch (format) {
        case 'json':
          const [infoResponse1, dataResponse] = await Promise.all([
            http.datatables.getDatatableInfo(datatableId),
            http.datatables.getDatatableData(datatableId),
          ]);
          if (infoResponse1.status !== 200) return reject(response.data);
          if (dataResponse.status !== 200) return reject(dataResponse.data);

          output = {
            id: infoResponse1.data.id,
            name: infoResponse1.data.name,
            orgId: infoResponse1.data.orgId,
            columnInfo: infoResponse1.data.columnInfo,
            rows: dataResponse.data.rows.map((row) => row.value),
          };
          break;
        case 'csv':
        default:
          const [infoResponse2, csvResponse] = await Promise.all([
            http.datatables.getDatatableInfo(datatableId),
            http.datatables.getDatatable(datatableId),
          ]);
          if (infoResponse2.status !== 200) return reject(response.data);
          if (csvResponse.status !== 200) return reject(dataResponse.data);

          const typesRow = infoResponse2.data.columnInfo.reduce(
            (result, col, i) => {
              result += `${i ? ',' : ''}${col.type}`;
              return result;
            },
            ''
          );

          const rows = csvResponse.data.split(`\n`);
          const datatable = [
            rows[0],
            typesRow,
            ...rows.splice(1, rows.length),
          ].join(`\n`);

          output = {
            id: infoResponse2.data.id,
            name: infoResponse2.data.name,
            orgId: infoResponse2.data.orgId,
            data: datatable,
          };
      }
    } catch (e) {
      reject(e);
    }
    resolve(output);
  });

export const uploadDatatable = ({ name, columnInfo, data }) =>
  new Promise(async (resolve, reject) => {
    const { orgId } = connection.getConnection();
    const fd = new FormData();
    fd.append('orgId', orgId);
    fd.append('name', name);
    fd.append('columnInfo', JSON.stringify(columnInfo));
    fd.append('file', Buffer.from(data), { filename: 'datatable.csv' });
    try {
      const response = await http.datatables.postDatatable(fd);
      if (response.status !== 200) {
        return reject(response.data);
      }
      resolve(response.data);
    } catch (e) {
      reject(e);
    }
  });

export const updateDatatable = ({ datatableId, name, columnInfo, data }) =>
  new Promise(async (resolve, reject) => {
    const { orgId } = connection.getConnection();

    const fd = new FormData();
    fd.append('orgId', orgId);
    fd.append('name', name);
    fd.append('columnInfo', JSON.stringify(columnInfo));
    fd.append('file', Buffer.from(data), { filename: 'datatable.csv' });
    try {
      const response = await http.datatables.putDatatable(datatableId, fd);
      if (response.status !== 200) {
        return reject(response.data);
      }
      resolve(response.data);
    } catch (e) {
      reject(e);
    }
  });