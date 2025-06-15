import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ChevronsUpDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react';
import { mutate } from 'swr';
import { useDebounce } from 'use-debounce';

import { useInstansiData } from '@/libs/swr';
import useToast from '@/hooks/use-hot-toast';

import Layout from '@/components/layout/Layout';
import Button from '@/components/systems/Button';
import Dialog from '@/components/systems/Dialog';
import Input from '@/components/systems/Input';
import Label from '@/components/systems/Label';
import LabeledInput from '@/components/systems/LabeledInput';
import ReactTable from '@/components/systems/ReactTable';
import Shimmer from '@/components/systems/Shimmer';
import TableSimple from '@/components/systems/TableSimple';
import Title from '@/components/systems/Title';

// Instansi.auth = true;
// This page secured through the middleware in root folder
export default function Instansi() {
  const { data, error } = useInstansiData();
  const { updateToast, pushToast, dismissToast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [createItem, setCreateItem] = useState({ id: null, nama: '', alias: '', alamat: '' });
  const [editItem, setEditItem] = useState({ id: null, nama: '', alias: '', alamat: '' });
  const [deleteItem, setDeleteItem] = useState({ id: null, nama: '' });
  const [search, setSearch] = useState('');
  const [searchDebounce] = useDebounce(search, 300);

  async function handleCreate() {
    const toastId = pushToast({
      message: `Menyimpan Instansi`,
      isLoading: true,
    });
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/instansi`, createItem);
      if (res.status == 200) {
        setOpenCreateDialog(false);
        setCreateItem({ id: null, nama: '', alias: '', alamat: '' });
        updateToast({ toastId, message: res?.data?.message, isError: false });
        mutate(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/instansi`);
      }
    } catch (error) {
      console.error(error);
      if (Array.isArray(error?.response?.data?.message)) {
        const errors = [...error?.response?.data?.message].reverse();
        dismissToast();
        errors.forEach((item: any) => {
          pushToast({ message: item?.message, isError: true });
        });
      } else {
        updateToast({ toastId, message: error?.response?.data?.message, isError: true });
      }
    }
  }

  async function handleEdit() {
    const toastId = pushToast({
      message: 'Memperbarui Instansi',
      isLoading: true,
    });
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/instansi`, editItem);
      if (res.status == 201) {
        setOpenEditDialog(false);
        setEditItem({ id: null, nama: '', alias: '', alamat: '' });
        updateToast({ toastId, message: res?.data?.message, isError: false });
        mutate(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/instansi`);
      }
    } catch (error) {
      console.error(error);
      if (Array.isArray(error?.response?.data?.message)) {
        const errors = [...error?.response?.data?.message].reverse();
        // show all error
        dismissToast();
        errors.forEach((item: any) => {
          pushToast({ message: item?.message, isError: true });
        });
      } else {
        updateToast({ toastId, message: error?.response?.data?.message, isError: true });
      }
    }
  }

  async function handleDelete() {
    const toastId = pushToast({
      message: `Menghapus Instansi`,
      isLoading: true,
    });
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/instansi?id=${deleteItem.id}`);
      if (res.status == 200) {
        setOpenDeleteDialog(false);
        setDeleteItem({ id: null, nama: '' });
        updateToast({ toastId, message: res?.data?.message, isError: false });
        mutate(`${process.env.NEXT_PUBLIC_API_ROUTE}/api/instansi`);
      }
    } catch (error) {
      console.error(error);
      const { detail } = error?.response?.data;
      if (detail) {
        updateToast({ toastId, message: detail, isError: true });
      } else {
        updateToast({ toastId, message: error?.response?.data?.message, isError: true });
      }
    }
  }

  function handleShowEditModal(id: any, nama: any, alias: any, alamat: any) {
    setEditItem({ id: id, nama: nama, alias: alias, alamat: alamat });
    setOpenEditDialog(true);
  }

  function handleShowDeleteModal(id: any, nama: any) {
    setDeleteItem({ id: id, nama: nama });
    setOpenDeleteDialog(true);
  }

  const column = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'id',
        width: 300,
        Cell: (row: any) => {
          return row.cell.row.index + 1;
        },
      },
      {
        Header: 'Nama',
        accessor: 'nama',
        width: 300,
        Cell: (row: any) => {
          const { values, original } = row.cell.row;
          return (
            <Link
              href={`instansi/detail/${values.id}`}
              className='rounded text-sm font-medium transition-all duration-200 hover:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
            >
              {values.nama}
            </Link>
          );
        },
      },
      {
        Header: 'Alias',
        accessor: 'alias',
        disableSortBy: true,
        width: 300,
        Cell: (row: any) => {
          const { values, original } = row.cell.row;
          return values.alias;
        },
      },
      {
        Header: 'Kendaraan',
        accessor: 'kendaraan',
        disableSortBy: true,
        width: 300,
        Cell: (row: any) => {
          const { values, original } = row.cell.row;
          return '-';
        },
      },
      {
        Header: 'Aksi',
        disableSortBy: true,
        width: 300,
        Cell: (row: any) => {
          const { values, original } = row.cell.row;
          return (
            <div>
              <Button
                className='mr-1 !px-[6px] !py-[2px]'
                onClick={() => handleShowEditModal(values.id, values.nama, values.alias, original.alamat)}
              >
                Edit
              </Button>
              <Button.danger
                className='!px-[6px] !py-[2px]'
                onClick={() => handleShowDeleteModal(values.id, values.nama)}
              >
                Hapus
              </Button.danger>
            </div>
          );
        },
      },
    ],
    [],
  );

  const tableInstance = useRef(null);
  useEffect(() => {
    tableInstance?.current?.setGlobalFilter(searchDebounce);
  }, [searchDebounce]);

  if (error) {
    return (
      <Layout title='Instansi - BPKAD'>
        <div className='flex h-[36rem] items-center justify-center text-base'>Failed to load</div>
      </Layout>
    );
  }

  return (
    <Layout title='Instansi - BPKAD' prefetch={['/api/instansi']} description='View and Manage Instansi - BPKAD'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-y-3'>
        <Title>Instansi</Title>
        <Button.success onClick={() => setOpenCreateDialog(true)} className='flex items-center gap-2'>
          <PlusIcon className='h-4 w-4' />
          Tambah Instansi
        </Button.success>
      </div>

      <Label>Cari Instansi</Label>
      <Input name='search' placeholder='Nama Instansi' onChange={(e) => setSearch(e.target.value)} />

      <Dialog
        title='Tambah Instansi'
        open={openCreateDialog}
        setOpen={setOpenCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setCreateItem({ id: null, nama: '', alias: '', alamat: '' });
        }}
        onConfirm={handleCreate}
        confirmText='Simpan'
        cancelText='Batal'
      >
        <div className='mt-5'>
          <LabeledInput
            label='Nama'
            type='text'
            name='nama'
            value={createItem.nama}
            onChange={(e) => setCreateItem({ ...createItem, nama: e.target.value })}
            placeholder='Nama Instansi'
          />
          <LabeledInput
            label='Alias'
            type='text'
            name='alias'
            value={createItem.alias}
            onChange={(e) => setCreateItem({ ...createItem, alias: e.target.value })}
            placeholder='Singkatan Instansi'
          />
          <LabeledInput
            label='Alamat'
            type='text'
            name='alamat'
            value={createItem.alamat}
            onChange={(e) => setCreateItem({ ...createItem, alamat: e.target.value })}
            placeholder='Alamat Instansi'
          />
        </div>
      </Dialog>

      <Dialog
        title='Edit Instansi'
        open={openEditDialog}
        setOpen={setOpenEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onConfirm={handleEdit}
        confirmText='Simpan'
        cancelText='Batal'
        isEdit
      >
        <div className='mt-5'>
          <LabeledInput
            label='Name'
            type='text'
            name='name'
            value={editItem.nama}
            onChange={(e) => setEditItem({ ...editItem, nama: e.target.value })}
          />
          <LabeledInput
            label='Alias'
            type='text'
            name='alias'
            value={editItem.alias}
            onChange={(e) => setEditItem({ ...editItem, alias: e.target.value })}
          />
          <LabeledInput
            label='Alamat'
            type='text'
            name='alamat'
            value={editItem.alamat}
            onChange={(e) => setEditItem({ ...editItem, alamat: e.target.value })}
          />
        </div>
      </Dialog>

      <Dialog
        title='Hapus Instansi'
        open={openDeleteDialog}
        isDanger
        setOpen={setOpenDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDelete}
        confirmText='Hapus'
        cancelText='Batal'
      >
        <div className='mt-5 text-center sm:text-left'>
          Yakin ingin menghapus Instansi "<span className='font-semibold'>{deleteItem.nama}</span>" ?
        </div>
      </Dialog>

      {data ? (
        <ReactTable columns={column} data={data} ref={tableInstance} page_size={20} itemPerPage={[10, 20, 50, 100]} />
      ) : (
        <TableSimple
          head={
            <>
              <TableSimple.th className='flex items-center gap-1'>
                No <ChevronUpIcon className='h-4 w-4 opacity-50' />
              </TableSimple.th>
              <TableSimple.th className='w-64 md:w-80'>
                <div className='flex items-center gap-1'>
                  Nama <ChevronsUpDownIcon className='h-4 w-4 opacity-50' />
                </div>
              </TableSimple.th>
              <TableSimple.th className='w-80 text-left'>Alias</TableSimple.th>
              <TableSimple.th className='w-44 text-left'>Kendaraan</TableSimple.th>
              <TableSimple.th className='w-32 text-left'>Aksi</TableSimple.th>
            </>
          }
        >
          {[...Array(10).keys()].map((e, index) => (
            <TableSimple.tr key={index}>
              <TableSimple.td shrink>
                <Shimmer className='p-3' />
              </TableSimple.td>
              <TableSimple.td>
                <Shimmer className='p-3' />
              </TableSimple.td>
              <TableSimple.td>
                <Shimmer className='p-3' />
              </TableSimple.td>
              <TableSimple.td>
                <Shimmer className='p-3' />
              </TableSimple.td>
              <TableSimple.td>
                <Shimmer className='p-3' />
              </TableSimple.td>
            </TableSimple.tr>
          ))}
        </TableSimple>
      )}
    </Layout>
  );
}
