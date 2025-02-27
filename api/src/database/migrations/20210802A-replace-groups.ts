import { Knex } from 'knex';
import logger from '../../logger';

export async function up(knex: Knex): Promise<void> {
	const dividerGroups = await knex.select('*').from('directus_fields').where('interface', '=', 'group-divider');

	for (const dividerGroup of dividerGroups) {
		const newOptions: { showHeader: true; headerIcon?: string; headerColor?: string } = { showHeader: true };

		if (dividerGroup.options) {
			try {
				const options =
					typeof dividerGroup.options === 'string' ? JSON.parse(dividerGroup.options) : dividerGroup.options;

				if (options.icon) newOptions.headerIcon = options.icon;
				if (options.color) newOptions.headerColor = options.color;
			} catch (err) {
				logger.warn(`Couldn't convert previous options from field ${dividerGroup.collection}.${dividerGroup.field}`);
				logger.warn(err);
			}
		}

		try {
			await knex('directus_fields')
				.update({
					interface: 'group-standard',
					options: JSON.stringify(newOptions),
				})
				.where('id', '=', dividerGroup.id);
		} catch (err) {
			logger.warn(`Couldn't update ${dividerGroup.collection}.${dividerGroup.field} to new group interface`);
			logger.warn(err);
		}
	}

	await knex('directus_fields')
		.update({
			interface: 'group-standard',
		})
		.where({ interface: 'group-raw' });
}

export async function down(knex: Knex): Promise<void> {
	await knex('directus_fields')
		.update({
			interface: 'group-raw',
		})
		.where('interface', '=', 'group-standard');
}
