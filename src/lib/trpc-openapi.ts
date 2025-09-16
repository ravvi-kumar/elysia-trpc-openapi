import { generateOpenApiDocument } from 'trpc-to-openapi';
import { appRouter } from "../routers";

export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: 'tRPC OpenAPI',
	version: '1.0.0',
	baseUrl: 'http://localhost:3000',
});

export const TrpcOpenAPI = {
	getPaths: (prefix = '') => {
		const paths = openApiDocument.paths ?? {};
		const reference: Record<string, any> = Object.create(null);

		for (const path of Object.keys(paths as object)) {
			let key = path;
			if (prefix) {
				if (path.startsWith(prefix + '/')) {
					key = path;
				} else if (path.startsWith('/')) {
					key = prefix + path;
				} else {
					key = prefix + '/' + path;
				}
			}
			reference[key] = (paths as any)[path];

			for (const method of Object.keys((paths as any)[path] ?? {})) {
				const operation = (reference[key] as any)[method] ?? {};
				operation.tags = ['tRPC'];
				(reference[key] as any)[method] = operation;
			}
		}

		return reference as any;
	},
	components: (openApiDocument.components ?? {}) as any
} as const;


