import resources from '@logto/phrases-experience';
import { type OrganizationCenterMember, OrganizationManagementRoleType } from '@logto/schemas';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';

import { setupI18nForTesting } from '@ac/jest.setup';

import MemberListItem from './MemberListItem';

jest.mock('@blobatar/react', () => ({
  Blobatar: ({ name }: { readonly name: string }) => <div data-testid="avatar" data-seed={name} />,
}));

const member: OrganizationCenterMember = {
  id: 'opaque-user-id',
  username: 'ryan',
  name: null,
  avatar: null,
  primaryEmail: null,
  createdAt: 1,
  organizationRoles: [],
  isOwner: true,
  organizationManagementRoles: [
    { id: 'owner-id', name: 'Owner', type: OrganizationManagementRoleType.Owner },
  ],
};

const onSave = jest.fn();
const onRemove = jest.fn();
const onUnassignRole = jest.fn();

const MemberFixture = ({ hasRoles = true }: { readonly hasRoles?: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  return (
    <MemberListItem
      isOwner
      hasBusinessRolePermission
      hasRemoveMemberPermission
      hasUnassignRolePermission
      member={member}
      isEditing={isEditing}
      availableRoles={hasRoles ? [{ id: 'reader', name: 'Document reader' }] : []}
      selectedRoleIds={selectedRoleIds}
      onChangeRoles={setSelectedRoleIds}
      onToggleEditor={() => {
        setIsEditing((previous) => !previous);
      }}
      onCancel={() => {
        setIsEditing(false);
      }}
      onSave={onSave}
      onRemove={onRemove}
      onUnassignRole={onUnassignRole}
    />
  );
};

beforeEach(async () => {
  jest.clearAllMocks();
  await setupI18nForTesting(resources['zh-CN']);
});

it('shows the username and a single localized Owner badge', () => {
  render(<MemberFixture />);
  expect(screen.getByText('ryan')).toBeDefined();
  expect(screen.queryByText(member.id)).toBeNull();
  expect(screen.queryByText('Owner')).toBeNull();
  expect(screen.getAllByText('所有者')).toHaveLength(1);
});

it('expands a separate full-width editor without moving or replacing the member summary', () => {
  render(<MemberFixture />);
  const username = screen.getByText('ryan');
  const avatarSeed = screen.getByTestId('avatar').dataset.seed;
  const toggle = screen.getByRole('button', { name: '业务角色' });
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(toggle);
  const editor = document.querySelector(`[id="${toggle.getAttribute('aria-controls') ?? ''}"]`);
  expect(editor?.className).toBe('memberRoleEditor');
  expect(username.closest('.memberSummary')?.parentElement).toBe(editor?.parentElement);
  expect(editor?.contains(username)).toBe(false);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByTestId('avatar').dataset.seed).toBe(avatarSeed);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Document reader' }));
  expect(screen.getByRole('checkbox', { checked: true })).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: '保存更改' }));
  expect(onSave).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: '取消' }));
  expect(screen.queryByRole('checkbox')).toBeNull();
  expect(screen.getByText('ryan')).toBe(username);
});

it('shows a localized empty state when no business roles have been shared', () => {
  render(<MemberFixture hasRoles={false} />);
  fireEvent.click(screen.getByRole('button', { name: '业务角色' }));
  expect(screen.getByText('暂无可用的业务角色，请联系租户管理员为此组织开放角色。')).toBeDefined();
  expect(screen.getByRole('button', { name: '取消' })).toBeDefined();
  expect(screen.queryByRole('checkbox')).toBeNull();
});
