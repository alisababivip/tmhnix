"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePostStatus = exports.updatePost = exports.createPost = exports.getPost = exports.getPosts = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getPosts(uuid, categoryName, tagName, status) {
    // @ts-ignore
    const where = {};
    if (uuid) {
        const user = await prisma_1.default.user.findUnique({ where: { uuid: uuid } });
        if (!user) {
            throw new Error('User not found.');
        }
        const author = await prisma_1.default.author.findUnique({
            where: { user_id: user.id },
        });
        if (!author) {
            throw new Error('Author not found.');
        }
        where.author_id = author.id;
    }
    if (categoryName) {
        const category = await prisma_1.default.category.findFirst({
            where: {
                name: categoryName,
            },
        });
        if (!category) {
            throw new Error('Category not found.');
        }
        where.category_id = category.id;
    }
    if (status) {
        where.status = status;
    }
    if (tagName) {
        const tag = await prisma_1.default.tag.findFirst({
            where: {
                name: tagName,
            },
        });
        if (!tag) {
            throw new Error('Tag not found.');
        }
        where.post_tag = {
            some: {
                tag_id: tag.id,
            },
        };
    }
    return (await prisma_1.default.post.findMany({
        where,
        include: {
            author: {
                include: {
                    user: {
                        select: {
                            id: true,
                            uuid: true,
                            first_name: true,
                            last_name: true,
                            avatar: true,
                        },
                    },
                },
            },
            category: true,
            post_tag: {
                include: {
                    tag: true, // Include tag details in the post_tag pivot records.
                },
            },
        },
    }));
}
exports.getPosts = getPosts;
async function getPost(id) {
    return await prisma_1.default.post.findUnique({
        where: { id },
        include: {
            author: true,
            category: true,
            post_tag: {
                include: {
                    tag: true, // Include tag details in the post_tag pivot records.
                },
            },
        },
    });
}
exports.getPost = getPost;
async function createPost(userId, data) {
    try {
        const author = await prisma_1.default.author.findUnique({
            where: { user_id: userId },
        });
        if (!author) {
            throw new Error('Author not found.');
        }
        // Destructure and prepare data
        const { tags, title, category, ...postData } = data;
        const slug = await createSlug(title);
        // Create post using Prisma transaction
        const createPostTransaction = prisma_1.default.$transaction([
            prisma_1.default.post.create({
                data: {
                    ...postData,
                    title,
                    slug,
                    author: {
                        connect: { id: author.id },
                    },
                    category: {
                        connect: { id: category },
                    },
                    post_tag: {
                        create: tags.map((tagId) => ({ tag_id: tagId })),
                    },
                },
            }),
        ]);
        const [newPost] = await createPostTransaction;
        return newPost;
    }
    catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}
exports.createPost = createPost;
async function createSlug(title) {
    // Replace non-word characters with dashes, convert to lowercase, and trim dashes from start/end
    let slug = title
        .replace(/\W+/g, '-')
        .toLowerCase()
        .replace(/^-+|-+$/g, '');
    // Check if a post with this slug already exists
    const existingPost = await prisma_1.default.post.findUnique({
        where: { slug },
    });
    // If a post with this slug exists, append the current date to the end
    if (existingPost) {
        const date = new Date();
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        slug = `${slug}-${dateString}`;
    }
    return slug;
}
async function updatePost(userId, slug, data) {
    // Find author by user ID
    const author = await prisma_1.default.author.findUnique({
        where: { user_id: userId },
    });
    if (!author) {
        return new Error('Author not found.');
    }
    const { tags, category, ...postData } = data;
    // Check if the post exists
    const existingPost = await prisma_1.default.post.findUnique({
        where: { slug: slug },
    });
    if (!existingPost) {
        return new Error('Post not found.');
    }
    // Update the post
    return await prisma_1.default.post.update({
        where: { slug: slug },
        data: {
            ...postData,
            author: {
                connect: { id: author.id },
            },
            category: {
                connect: { id: category },
            },
            post_tag: {
                // Delete all existing tags for this post
                deleteMany: {},
                // Create the new tags
                create: tags.map((tagId) => ({ tag_id: tagId })),
            },
        },
    });
}
exports.updatePost = updatePost;
async function updatePostStatus(id, status) {
    return await prisma_1.default.post.update({
        where: { id },
        data: { status },
    });
}
exports.updatePostStatus = updatePostStatus;
async function deletePost(userId, id) {
    const author = await prisma_1.default.author.findUnique({
        where: { user_id: userId },
    });
    if (!author) {
        throw new Error('Author not found.');
    }
    return await prisma_1.default.post.delete({
        where: { id: id, author_id: author.id },
    });
}
exports.deletePost = deletePost;
