import axiosClient from '../../../shared/api/axiosClient';

export const adminApi = {
    getUsers: async (params = {}) => {
        const { data } = await axiosClient.get('/users', { params });
        return data;
    },

    getUserById: async (id) => {
        const { data } = await axiosClient.get(`/users/${id}`);
        return data;
    },

    createUser: async (userData) => {
        // Kiểm tra trùng email trước khi tạo
        const existingUsers = await adminApi.getUsers();
        const normalizedEmail = String(userData.email || '').trim().toLowerCase();
        const isDuplicate = existingUsers.some(
            (u) => String(u.email).toLowerCase() === normalizedEmail
        );

        if (isDuplicate) {
            throw new Error('Email này đã tồn tại trong hệ thống. Vui lòng chọn email khác.');
        }

        const payload = {
            ...userData,
            email: normalizedEmail,
            fullName: String(userData.fullName || '').trim(),
            roles: Array.isArray(userData.roles) ? userData.roles : [userData.roles || 'CUSTOMER'],
            isActive: userData.isActive !== undefined ? userData.isActive : true,
        };

        const { data } = await axiosClient.post('/users', payload);
        return data;
    },

    updateUser: async (id, updateData) => {
        // Kiểm tra trùng email với các user khác (ngoại trừ user hiện tại)
        if (updateData.email) {
            const existingUsers = await adminApi.getUsers();
            const normalizedEmail = String(updateData.email).trim().toLowerCase();
            const isDuplicate = existingUsers.some(
                (u) => String(u.id) !== String(id) && String(u.email).toLowerCase() === normalizedEmail
            );
            if (isDuplicate) {
                throw new Error('Email này đã được sử dụng bởi một tài khoản khác.');
            }
            updateData.email = normalizedEmail;
        }

        const { data } = await axiosClient.patch(`/users/${id}`, updateData);
        return data;
    },
};

export default adminApi;
