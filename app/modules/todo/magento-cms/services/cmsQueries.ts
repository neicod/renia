// @env: mixed
export const CMS_PAGE_BY_IDENTIFIER = `
  query CmsPage($identifier: String!) {
    cmsPage(identifier: $identifier) {
      identifier
      title
      content
    }
  }
`;

