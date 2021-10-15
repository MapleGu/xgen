import { Button, Form, Popover } from 'antd'
import clsx from 'clsx'
import moment from 'moment'
import { useMemo } from 'react'
import { getDvaApp, history, useParams } from 'umi'

import Dynamic from '@/cloud/core'
import { Icon } from '@/components'
import { CheckOutlined } from '@ant-design/icons'

const getText = (dataIndex: string, dataItem: any, v: any, item: any, _columns: any) => {
	let text = v

	if (dataIndex.indexOf('.') !== -1) {
		const indexs = dataIndex.split('.')

		text = indexs.reduce((total: any, it: any) => {
			total = total[it]

			return total
		}, dataItem)
	}

	if (item.title.indexOf('时间') !== -1) {
		text = v ? moment(v).format(_columns[item.title].view.props['datetime-format']) : '-'
	}

	if (item.view.type === 'image') {
		return text
	}

	return Array.isArray(text) ? text.join(',') : text !== undefined || null ? text : '-'
}

export const useColumns = (setting: any) => {
	const params = useParams<{ name: string }>()

	const columns = useMemo(() => {
		if (!setting.columns) return []

		const _columns = setting.columns
		const _layouts = setting.list.layout.columns

		const onFinish = (v: any, id: number) => {
			getDvaApp()._store.dispatch({
				type: `${history.location.pathname}/save`,
				payload: { name: params.name, data: { id, ...v } }
			})
		}

		const columns = _layouts.reduce((total: Array<any>, it: any, index: number) => {
			const item = {
				..._columns[it.name],
				title: it.name
			}

			if (it.width) item['width'] = it.width

			item.dataIndex = _columns[item.title].view.props.value.replace(':', '')

			if (item.edit && Object.keys(item.edit).length) {
				item.render = (v: any, dataItem: any) => {
					const text = getText(item.dataIndex, dataItem, v, item, _columns)
					const key = _columns[item.title].edit.props.value.replace(':', '')
					const value =
						item.edit.type === 'select'
							? dataItem[key]
								? dataItem[key]
								: []
							: dataItem[key]

					return (
						<Popover
							id='td_popover'
							overlayClassName={clsx([
								'td_popover',
								item.edit.type === 'upload' ? 'upload' : ''
							])}
							placement={item.edit.type === 'upload' ? 'bottom' : 'top'}
							trigger='click'
							destroyTooltipOnHide={{ keepParent: false }}
							content={
								<Form
									className='flex'
									name={`form_table_td_${item.dataIndex}_${index}`}
									initialValues={{
										[key]: value
									}}
									onFinish={(v) => {
										onFinish(v, dataItem.id)

										const td_popover =
											document.getElementById(
												'td_popover'
											)

										if (!td_popover) return

										td_popover.style.display = 'none'
									}}
								>
									<Dynamic
										type='form'
										name={item.edit.type}
										props={{
											...item.edit.props,
											label: item.label,
											name: key,
											style: { width: 240 }
										}}
									></Dynamic>
									<Button
										className='ml_12'
										type='primary'
										htmlType='submit'
										icon={<CheckOutlined></CheckOutlined>}
									></Button>
								</Form>
							}
						>
							<div className='edit_text line_clamp_2'>
								{item.view.type ? (
									<Dynamic
										type='base'
										name={item.view.type}
										props={{
											...item.view.props,
											value: text
										}}
									></Dynamic>
								) : (
									text || '-'
								)}
							</div>
						</Popover>
					)
				}
			} else {
				item.render = (v: any, dataItem: any) => (
					<div className='line_clamp_2'>
						{getText(item.dataIndex, dataItem, v, item, _columns)}
					</div>
				)
			}

			total.push(item)

			return total
		}, [])

		columns.push({
			title: '操作',
			key: 'operation',
			width: '60px',
			render: (_: any, item: any) => (
				<div className='flex justify_end'>
					<Popover
						overlayClassName='options_popover'
						placement='bottomRight'
						trigger='click'
						destroyTooltipOnHide={{ keepParent: false }}
						content={
							<div className='table_option_items flex flex_column'>
								<div
									className='table_option_item flex align_center cursor_point'
									onClick={() =>
										history.push({
											pathname: `/form/${params.name}/${item.id}`
										})
									}
								>
									<Icon name='icon-eye' size={13}></Icon>
									<span className='text'>查看</span>
								</div>
							</div>
						}
					>
						<a className='option_icon_wrap flex justify_center align_center clickable'>
							<Icon name='icon-more-vertical' size={18}></Icon>
						</a>
					</Popover>
				</div>
			)
		})

		return columns
	}, [setting])

	return columns
}
