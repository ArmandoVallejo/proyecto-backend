const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Proyecto Backend API',
    version: '1.0.0',
    description: 'API para gestionar proyectos y ficheros. Documentación generada manualmente para comenzar con Swagger UI.'
  },
  servers: [
    {
      url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000',
      description: 'Local server'
    }
  ],
  tags: [
    { name: 'Projects', description: 'Operaciones sobre proyectos' },
    { name: 'Files', description: 'Operaciones sobre archivos (upload/serve/delete)' }
  ],
  components: {
    schemas: {
      Project: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { type: 'string' },
          tasks: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  },
  paths: {
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Obtener todos los proyectos',
        responses: {
          '200': {
            description: 'Lista de proyectos',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Project' } } } }
          }
        }
      },
      post: {
        tags: ['Projects'],
        summary: 'Crear un nuevo proyecto',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } }
        },
        responses: { '201': { description: 'Proyecto creado' } }
      }
    },
    '/api/projects/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del proyecto' }
      ],
      get: {
        tags: ['Projects'],
        summary: 'Obtener proyecto por ID',
        responses: { '200': { description: 'Proyecto', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } }, '404': { description: 'No encontrado' } }
      },
      put: {
        tags: ['Projects'],
        summary: 'Actualizar proyecto',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
        responses: { '200': { description: 'Proyecto actualizado' }, '404': { description: 'No encontrado' } }
      },
      delete: {
        tags: ['Projects'],
        summary: 'Eliminar proyecto',
        responses: { '204': { description: 'Eliminado' }, '404': { description: 'No encontrado' } }
      }
    },
    '/api/projects/{projectId}/files': {
      parameters: [ { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } } ],
      post: {
        tags: ['Files'],
        summary: 'Subir archivos a un proyecto',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { files: { type: 'string', format: 'binary' } }
              }
            }
          }
        },
        responses: { '200': { description: 'Archivos subidos' } }
      },
      get: {
        tags: ['Files'],
        summary: 'Listar archivos de un proyecto',
        responses: { '200': { description: 'Lista de archivos', content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } } } }
      }
    },
    '/api/projects/{projectId}/files/stats': {
      parameters: [ { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } } ],
      get: { tags: ['Files'], summary: 'Estadísticas de archivos del proyecto', responses: { '200': { description: 'Estadísticas' } } }
    },
    '/api/projects/{projectId}/files/{fileId}': {
      parameters: [ { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'fileId', in: 'path', required: true, schema: { type: 'string' } } ],
      delete: { tags: ['Files'], summary: 'Eliminar archivo del proyecto', responses: { '204': { description: 'Eliminado' }, '404': { description: 'No encontrado' } } }
    },
    '/api/files/{filename}': {
      parameters: [ { name: 'filename', in: 'path', required: true, schema: { type: 'string' } } ],
      get: { tags: ['Files'], summary: 'Servir/descargar un archivo', responses: { '200': { description: 'Archivo (binary)' }, '404': { description: 'No encontrado' } } }
    }
  }
};

module.exports = swaggerSpec;
