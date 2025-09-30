import slugify from 'slugify';
import { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';

async function slugExists<T extends { slug: string }>(
  slug: string,
  repository: Repository<T>,
): Promise<boolean> {
  const count = await repository.count({
    where: { slug } as FindOptionsWhere<T>,
  });
  return count > 0;
}

export async function slugGenerate<T extends { slug: string }>(
  name: string,
  repository: Repository<T>,
): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true });
  let counter = 1;
  let slug = baseSlug;

  while (await slugExists(slug, repository)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
