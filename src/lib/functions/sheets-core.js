import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

/**
 * Google Auth Helper
 */
const getAuth = (clientEmail, privateKey) => {
    return new JWT({
        email: clientEmail,
        key: privateKey.replace(/"/g, '').replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
};

/**
 * Get Sheet Helper
 */
const getSheet = async (doc, sheetName) => {
    await doc.loadInfo();
    if (sheetName) {
        const sheet = doc.sheetsByTitle[sheetName];
        if (!sheet) {
            throw new Error(`시트(${sheetName})가 존재하지 않습니다.`);
        }
        return sheet;
    }
    return doc.sheetsByIndex[0];
};

/**
 * Find Row by UUID Helper
 */
const findRowByUuid = async (sheet, uuid) => {
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    const idHeader = headers.find(h => ['id', 'ID', 'uuid', 'UUID', 'Uuid'].includes(h));

    if (!idHeader) {
        throw new Error('시트에서 ID/UUID 헤더를 찾을 수 없습니다.');
    }

    const rows = await sheet.getRows();
    const row = rows.find(r => String(r.get(idHeader)) === String(uuid));

    if (!row) {
        throw new Error('데이터를 찾을 수 없습니다. (ID 불일치)');
    }

    return { row, idHeader };
};

export async function getSheetsData(params) {
    const { sheetId, clientEmail, privateKey, filters, sheetName } = params;

    if (!sheetId || !clientEmail || !privateKey) {
        throw new Error('모든 설정값을 입력해주세요.');
    }

    const serviceAccountAuth = getAuth(clientEmail, privateKey);
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    const sheet = await getSheet(doc, sheetName);

    const rows = await sheet.getRows();
    const headerValues = sheet.headerValues;

    let data = rows.map(row => {
        const rowData = {};
        headerValues.forEach(header => {
            rowData[header] = row.get(header) || '';
        });
        return rowData;
    });

    // Filtering
    if (filters) {
        if (headerValues.includes('date')) {
            if (filters.startDate) data = data.filter(item => item.date >= filters.startDate);
            if (filters.endDate) data = data.filter(item => item.date <= filters.endDate);
        }

        Object.keys(filters).forEach(key => {
            if (key === 'startDate' || key === 'endDate') return;
            const filterVal = filters[key];
            if (filterVal && filterVal !== 'all') {
                const term = String(filterVal).toLowerCase();

                if (['account_name', 'account_company', 'name'].includes(key)) {
                    data = data.filter(item => item[key] && String(item[key]).toLowerCase().includes(term));
                } else if (['account_type', 'category'].includes(key)) {
                    data = data.filter(item => item[key] === filterVal);
                } else if (key === 'searchName') {
                    if (headerValues.includes('name')) {
                        data = data.filter(item => item['name'] && String(item['name']).toLowerCase().includes(term));
                    } else if (headerValues.includes('account_name')) {
                        data = data.filter(item => item['account_name'] && String(item['account_name']).toLowerCase().includes(term));
                    }
                } else if (headerValues.includes(key)) {
                    data = data.filter(item => item[key] === filterVal);
                }
            }
        });
    }

    // Sort by date desc
    if (headerValues.includes('date')) {
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return { data };
}

export async function addSheetsData(params) {
    const { sheetId, clientEmail, privateKey, item, sheetName } = params;

    if (!sheetId || !clientEmail || !privateKey || !item) {
        throw new Error('모든 데이터를 입력해주세요.');
    }

    const serviceAccountAuth = getAuth(clientEmail, privateKey);
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    const sheet = await getSheet(doc, sheetName);

    const newId = uuidv4();
    const newItem = {
        ...item,
        id: newId,
        ID: newId,
        uuid: newId,
        UUID: newId
    };

    await sheet.addRow(newItem);
    return { success: true, id: newId };
}

export async function updateSheetsData(params) {
    const { sheetId, clientEmail, privateKey, sheetName, uuid, item } = params;

    if (!sheetId || !clientEmail || !privateKey || !uuid || !item) {
        throw new Error('필수 데이터가 누락되었습니다.');
    }

    const serviceAccountAuth = getAuth(clientEmail, privateKey);
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    const sheet = await getSheet(doc, sheetName);

    const { row, idHeader } = await findRowByUuid(sheet, uuid);

    const updateData = { ...item };
    // Protect ID columns
    delete updateData[idHeader];
    if (idHeader !== 'id') delete updateData.id;
    if (idHeader !== 'uuid') delete updateData.uuid;

    row.assign(updateData);
    await row.save();

    return { success: true };
}

export async function deleteSheetsData(params) {
    const { sheetId, clientEmail, privateKey, sheetName, uuid } = params;

    if (!sheetId || !clientEmail || !privateKey || !uuid) {
        throw new Error('필수 데이터가 누락되었습니다.');
    }

    const serviceAccountAuth = getAuth(clientEmail, privateKey);
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    const sheet = await getSheet(doc, sheetName);

    const { row } = await findRowByUuid(sheet, uuid);

    await row.delete();

    return { success: true };
}
